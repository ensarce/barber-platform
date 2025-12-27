package com.barber.service;

import com.barber.dto.AppointmentDto;
import com.barber.entity.*;
import com.barber.exception.BadRequestException;
import com.barber.exception.ResourceNotFoundException;
import com.barber.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final ServiceRepository serviceRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final com.barber.domain.service.AppointmentAvailabilityService availabilityService;
    private final com.barber.common.infrastructure.event.DomainEventPublisher eventPublisher;
    
    @Transactional
    public AppointmentDto.AppointmentResponse createAppointment(Long customerId, AppointmentDto.CreateAppointmentRequest request) {
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        
        BarberProfile barberProfile = barberProfileRepository.findById(request.getBarberProfileId())
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));
        
        // Prevent barber from booking appointment at their own shop
        if (barberProfile.getUser().getId().equals(customerId)) {
            throw new BadRequestException("Kendi dükkanınıza randevu oluşturamazsınız");
        }
        
        if (barberProfile.getStatus() != BarberStatus.APPROVED) {
            throw new BadRequestException("Bu kuaför şu anda randevu almıyor");
        }
        
        com.barber.entity.Service service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Hizmet bulunamadı"));
        
        if (!service.getBarberProfile().getId().equals(barberProfile.getId())) {
            throw new BadRequestException("Bu hizmet bu kuaföre ait değil");
        }
        
        // Calculate end time
        LocalTime endTime = request.getStartTime().plusMinutes(service.getDurationMinutes());

        // Check if date is valid (not in past)
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Geçmiş bir tarihe randevu oluşturulamaz");
        }

        // Use domain service to validate availability
        availabilityService.validateAppointmentSlot(
                barberProfile,
                request.getAppointmentDate(),
                request.getStartTime(),
                endTime
        );
        
        Appointment appointment = Appointment.builder()
            .customer(customer)
            .barberProfile(barberProfile)
            .service(service)
            .appointmentDate(request.getAppointmentDate())
            .startTime(request.getStartTime())
            .endTime(endTime)
            .totalPrice(service.getPrice())
            .notes(request.getNotes())
            .build();
        
        appointment = appointmentRepository.save(appointment);

        // Publish domain events
        eventPublisher.publishAll(appointment.pullDomainEvents());

        return mapToResponse(appointment);
    }
    
    public Page<AppointmentDto.AppointmentResponse> getCustomerAppointments(Long customerId, Pageable pageable) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(customerId, pageable)
            .map(this::mapToResponse);
    }
    
    public Page<AppointmentDto.AppointmentResponse> getBarberAppointments(Long userId, Pageable pageable) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));
        
        return appointmentRepository.findByBarberProfileIdOrderByAppointmentDateDescStartTimeDesc(profile.getId(), pageable)
            .map(this::mapToResponse);
    }
    
    @Transactional
    public AppointmentDto.AppointmentResponse updateStatus(Long userId, Long appointmentId, AppointmentDto.UpdateStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Randevu bulunamadı"));

        // Check permission
        boolean isBarber = appointment.getBarberProfile().getUser().getId().equals(userId);
        boolean isCustomer = appointment.getCustomer().getId().equals(userId);

        if (!isBarber && !isCustomer) {
            throw new BadRequestException("Bu randevuyu güncelleme yetkiniz yok");
        }

        // Use business method for status update (includes validation)
        appointment.updateStatus(request.getStatus(), userId, isBarber, isCustomer);
        appointment = appointmentRepository.save(appointment);

        // Publish domain events
        eventPublisher.publishAll(appointment.pullDomainEvents());

        return mapToResponse(appointment);
    }
    
    @Transactional
    public void cancelAppointment(Long userId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Randevu bulunamadı"));

        // Use business method for cancellation (includes validation and permission check)
        appointment.cancel(userId, null);
        appointmentRepository.save(appointment);

        // Publish domain events
        eventPublisher.publishAll(appointment.pullDomainEvents());
    }
    
    public AppointmentDto.AvailableSlotsResponse getAvailableSlots(Long barberProfileId, LocalDate date, Integer serviceDuration) {
        BarberProfile profile = barberProfileRepository.findById(barberProfileId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));

        int slotDuration = serviceDuration != null ? serviceDuration : 30;

        // Use domain service to generate available slots
        List<com.barber.domain.service.AppointmentAvailabilityService.TimeSlot> domainSlots =
                availabilityService.generateAvailableSlots(profile, date, slotDuration);

        // Convert domain time slots to DTOs
        List<AppointmentDto.TimeSlot> dtoSlots = domainSlots.stream()
                .map(slot -> new AppointmentDto.TimeSlot(
                        slot.getStartTime(),
                        slot.getEndTime(),
                        slot.isAvailable()
                ))
                .collect(Collectors.toList());

        AppointmentDto.AvailableSlotsResponse response = new AppointmentDto.AvailableSlotsResponse();
        response.setDate(date);
        response.setSlots(dtoSlots);
        return response;
    }
    
    // Removed: isTimeSlotAvailable - Now using AppointmentAvailabilityService domain service

    private AppointmentDto.AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentDto.AppointmentResponse response = new AppointmentDto.AppointmentResponse();
        response.setId(appointment.getId());
        response.setCustomerId(appointment.getCustomer().getId());
        response.setCustomerName(appointment.getCustomer().getName());
        response.setBarberProfileId(appointment.getBarberProfile().getId());
        response.setBarberShopName(appointment.getBarberProfile().getShopName());
        response.setServiceId(appointment.getService().getId());
        response.setServiceName(appointment.getService().getName());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setStartTime(appointment.getStartTime());
        response.setEndTime(appointment.getEndTime());
        response.setStatus(appointment.getStatus());
        response.setTotalPrice(appointment.getTotalPrice());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        
        // Check if can review
        boolean canReview = appointment.getStatus() == AppointmentStatus.COMPLETED &&
            !reviewRepository.existsByAppointmentId(appointment.getId());
        response.setCanReview(canReview);
        
        return response;
    }
}
