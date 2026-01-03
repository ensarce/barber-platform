package com.barber.service;

import com.barber.dto.BarberDto;
import com.barber.dto.ServiceDto;
import com.barber.dto.WorkingHoursDto;
import com.barber.entity.*;
import com.barber.exception.BadRequestException;
import com.barber.exception.ResourceNotFoundException;
import com.barber.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BarberService {
    
    private final BarberProfileRepository barberProfileRepository;
    private final ServiceRepository serviceRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final UserRepository userRepository;
    
    private static final Map<DayOfWeek, String> DAY_NAMES = Map.of(
        DayOfWeek.MONDAY, "Pazartesi",
        DayOfWeek.TUESDAY, "Salı",
        DayOfWeek.WEDNESDAY, "Çarşamba",
        DayOfWeek.THURSDAY, "Perşembe",
        DayOfWeek.FRIDAY, "Cuma",
        DayOfWeek.SATURDAY, "Cumartesi",
        DayOfWeek.SUNDAY, "Pazar"
    );
    
    @Transactional
    public BarberDto.BarberDetailResponse createProfile(Long userId, BarberDto.CreateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        
        if (user.getRole() != Role.BARBER) {
            throw new BadRequestException("Sadece kuaförler profil oluşturabilir");
        }
        
        if (barberProfileRepository.findByUserId(userId).isPresent()) {
            throw new BadRequestException("Bu kullanıcı için zaten bir profil mevcut");
        }
        
        BarberProfile profile = BarberProfile.builder()
            .user(user)
            .shopName(request.getShopName())
            .description(request.getDescription())
            .address(request.getAddress())
            .city(request.getCity())
            .district(request.getDistrict())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .profileImage(request.getProfileImage())
            .build();
        
        profile = barberProfileRepository.save(profile);
        
        // Create default working hours for the new barber
        createDefaultWorkingHours(profile);
        
        return mapToDetailResponse(profile);
    }
    
    /**
     * Creates default working hours for a new barber profile
     * Monday-Saturday: 09:00-19:00 (open)
     * Sunday: closed
     */
    private void createDefaultWorkingHours(BarberProfile profile) {
        java.time.LocalTime defaultStart = java.time.LocalTime.of(9, 0);
        java.time.LocalTime defaultEnd = java.time.LocalTime.of(19, 0);
        
        for (DayOfWeek day : DayOfWeek.values()) {
            WorkingHours wh = WorkingHours.builder()
                .barberProfile(profile)
                .dayOfWeek(day)
                .startTime(day == DayOfWeek.SUNDAY ? null : defaultStart)
                .endTime(day == DayOfWeek.SUNDAY ? null : defaultEnd)
                .isClosed(day == DayOfWeek.SUNDAY)
                .build();
            
            workingHoursRepository.save(wh);
        }
    }
    
    @Transactional
    public BarberDto.BarberDetailResponse updateProfile(Long userId, BarberDto.UpdateProfileRequest request) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));

        profile.updateProfileDetails(
            request.getShopName(),
            request.getDescription(),
            request.getAddress(),
            request.getCity(),
            request.getDistrict(),
            request.getLatitude(),
            request.getLongitude(),
            request.getProfileImage()
        );

        profile = barberProfileRepository.save(profile);

        return mapToDetailResponse(profile);
    }
    
    public Page<BarberDto.BarberListResponse> getApprovedBarbers(String city, String district, Pageable pageable) {
        Page<BarberProfile> profiles = barberProfileRepository.findApprovedBarbers(city, district, pageable);
        return profiles.map(this::mapToListResponse);
    }
    
    public BarberDto.BarberDetailResponse getBarberById(Long id) {
        BarberProfile profile = barberProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));
        
        return mapToDetailResponse(profile);
    }
    
    public BarberDto.BarberDetailResponse getBarberByUserId(Long userId) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));
        
        return mapToDetailResponse(profile);
    }
    
    // Service management
    @Transactional
    public ServiceDto.ServiceResponse addService(Long userId, ServiceDto.CreateServiceRequest request) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));

        // Use aggregate method instead of direct entity creation
        com.barber.entity.Service service = profile.addService(
            request.getName(),
            request.getDescription(),
            request.getDurationMinutes(),
            request.getPrice()
        );

        // Save the aggregate root (cascade will save the service)
        barberProfileRepository.save(profile);

        return mapServiceToResponse(service);
    }
    
    @Transactional
    public ServiceDto.ServiceResponse updateService(Long userId, Long serviceId, ServiceDto.UpdateServiceRequest request) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));

        // Use aggregate method instead of direct entity modification
        com.barber.entity.Service service = profile.updateService(
            serviceId,
            request.getName(),
            request.getDescription(),
            request.getDurationMinutes(),
            request.getPrice(),
            request.getIsActive()
        );

        // Save the aggregate root (cascade will save the service)
        barberProfileRepository.save(profile);

        return mapServiceToResponse(service);
    }
    
    @Transactional
    public void deleteService(Long userId, Long serviceId) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));

        // Use aggregate method instead of direct repository delete
        profile.removeService(serviceId);

        // Save the aggregate root (cascade will delete the service)
        barberProfileRepository.save(profile);
    }
    
    public List<ServiceDto.ServiceResponse> getServices(Long barberProfileId) {
        return serviceRepository.findByBarberProfileIdAndIsActiveTrue(barberProfileId)
            .stream()
            .map(this::mapServiceToResponse)
            .collect(Collectors.toList());
    }
    
    // Working hours management
    @Transactional
    public List<WorkingHoursDto.WorkingHoursResponse> updateWorkingHours(Long userId, WorkingHoursDto.BulkWorkingHoursRequest request) {
        BarberProfile profile = barberProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför profili bulunamadı"));

        // Build working hours list
        List<WorkingHours> workingHoursList = request.getWorkingHours().stream()
            .map(wh -> WorkingHours.builder()
                .dayOfWeek(wh.getDayOfWeek())
                .startTime(wh.getStartTime())
                .endTime(wh.getEndTime())
                .isClosed(wh.getIsClosed() != null ? wh.getIsClosed() : false)
                .build())
            .collect(Collectors.toList());

        // Use aggregate method instead of direct repository manipulation
        profile.setWorkingHours(workingHoursList);

        // Save the aggregate root (cascade will save working hours)
        barberProfileRepository.save(profile);

        return getWorkingHours(profile.getId());
    }
    
    public List<WorkingHoursDto.WorkingHoursResponse> getWorkingHours(Long barberProfileId) {
        return workingHoursRepository.findByBarberProfileIdOrderByDayOfWeek(barberProfileId)
            .stream()
            .map(this::mapWorkingHoursToResponse)
            .collect(Collectors.toList());
    }
    
    // Mapping methods
    private BarberDto.BarberListResponse mapToListResponse(BarberProfile profile) {
        BarberDto.BarberListResponse response = new BarberDto.BarberListResponse();
        response.setId(profile.getId());
        response.setShopName(profile.getShopName());
        response.setCity(profile.getCity());
        response.setDistrict(profile.getDistrict());
        response.setProfileImage(profile.getProfileImage());
        response.setAverageRating(profile.getAverageRating());
        response.setTotalReviews(profile.getTotalReviews());
        
        // Get minimum price
        List<com.barber.entity.Service> services = serviceRepository.findByBarberProfileIdAndIsActiveTrue(profile.getId());
        if (!services.isEmpty()) {
            BigDecimal minPrice = services.stream()
                .map(com.barber.entity.Service::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO);
            response.setStartingPrice(minPrice + " TL'den başlayan fiyatlar");
        }
        
        return response;
    }
    
    private BarberDto.BarberDetailResponse mapToDetailResponse(BarberProfile profile) {
        BarberDto.BarberDetailResponse response = new BarberDto.BarberDetailResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUser().getId());
        response.setOwnerName(profile.getUser().getName());
        response.setShopName(profile.getShopName());
        response.setDescription(profile.getDescription());
        response.setAddress(profile.getAddress());
        response.setCity(profile.getCity());
        response.setDistrict(profile.getDistrict());
        response.setLatitude(profile.getLatitude());
        response.setLongitude(profile.getLongitude());
        response.setProfileImage(profile.getProfileImage());
        response.setAverageRating(profile.getAverageRating());
        response.setTotalReviews(profile.getTotalReviews());
        response.setStatus(profile.getStatus());
        
        response.setServices(serviceRepository.findByBarberProfileIdAndIsActiveTrue(profile.getId())
            .stream()
            .map(this::mapServiceToResponse)
            .collect(Collectors.toList()));
        
        response.setWorkingHours(workingHoursRepository.findByBarberProfileIdOrderByDayOfWeek(profile.getId())
            .stream()
            .sorted(Comparator.comparing(wh -> wh.getDayOfWeek().getValue()))
            .map(this::mapWorkingHoursToResponse)
            .collect(Collectors.toList()));
        
        return response;
    }
    
    private ServiceDto.ServiceResponse mapServiceToResponse(com.barber.entity.Service service) {
        ServiceDto.ServiceResponse response = new ServiceDto.ServiceResponse();
        response.setId(service.getId());
        response.setName(service.getName());
        response.setDescription(service.getDescription());
        response.setDurationMinutes(service.getDurationMinutes());
        response.setPrice(service.getPrice());
        response.setIsActive(service.getIsActive());
        return response;
    }
    
    private WorkingHoursDto.WorkingHoursResponse mapWorkingHoursToResponse(WorkingHours wh) {
        WorkingHoursDto.WorkingHoursResponse response = new WorkingHoursDto.WorkingHoursResponse();
        response.setId(wh.getId());
        response.setDayOfWeek(wh.getDayOfWeek());
        response.setDayName(DAY_NAMES.get(wh.getDayOfWeek()));
        response.setStartTime(wh.getStartTime());
        response.setEndTime(wh.getEndTime());
        response.setIsClosed(wh.getIsClosed());
        return response;
    }
}
