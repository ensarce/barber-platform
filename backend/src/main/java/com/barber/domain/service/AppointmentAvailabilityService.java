package com.barber.domain.service;

import com.barber.entity.Appointment;
import com.barber.entity.BarberProfile;
import com.barber.entity.WorkingHours;
import com.barber.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DOMAIN SERVICE: AppointmentAvailabilityService
 *
 * Handles business logic for checking appointment availability.
 * This is a domain service because:
 * 1. It operates on multiple aggregates (BarberProfile, Appointment)
 * 2. The logic doesn't naturally belong to any single aggregate
 * 3. It represents a domain concept (availability checking)
 *
 * Domain services are stateless and contain domain logic only.
 */
@Service
@RequiredArgsConstructor
public class AppointmentAvailabilityService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Check if a specific time slot is available for booking
     *
     * @param barberProfile The barber profile to check
     * @param date The appointment date
     * @param startTime The start time
     * @param endTime The end time
     * @return true if the slot is available
     */
    public boolean isTimeSlotAvailable(
            BarberProfile barberProfile,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        // Check if barber is open on this day and time
        if (!isWithinWorkingHours(barberProfile, date, startTime, endTime)) {
            return false;
        }

        // Check for conflicting appointments
        return !hasConflictingAppointments(barberProfile.getId(), date, startTime, endTime);
    }

    /**
     * Check if a time range is within the barber's working hours
     *
     * @param barberProfile The barber profile
     * @param date The date to check
     * @param startTime The start time
     * @param endTime The end time
     * @return true if within working hours
     */
    public boolean isWithinWorkingHours(
            BarberProfile barberProfile,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        // Use aggregate method to check working hours
        return barberProfile.getWorkingHoursForDay(dayOfWeek)
                .map(wh -> wh.isTimeRangeWithinWorkingHours(startTime, endTime))
                .orElse(false);
    }

    /**
     * Check if there are conflicting appointments in the given time range
     *
     * @param barberProfileId The barber profile ID
     * @param date The date
     * @param startTime The start time
     * @param endTime The end time
     * @return true if there are conflicts
     */
    public boolean hasConflictingAppointments(
            Long barberProfileId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                barberProfileId, date, startTime, endTime
        );
        return !conflicts.isEmpty();
    }

    /**
     * Generate all available time slots for a barber on a specific date
     *
     * @param barberProfile The barber profile
     * @param date The date to check
     * @param slotDurationMinutes Duration of each slot in minutes
     * @return List of time slots with availability status
     */
    public List<TimeSlot> generateAvailableSlots(
            BarberProfile barberProfile,
            LocalDate date,
            int slotDurationMinutes
    ) {
        List<TimeSlot> slots = new ArrayList<>();

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        WorkingHours workingHours = barberProfile.getWorkingHoursForDay(dayOfWeek)
                .orElse(null);

        // If no working hours or closed, return empty list
        if (workingHours == null || workingHours.isClosed()) {
            return slots;
        }

        // Generate slots from start to end of working hours
        LocalTime currentSlot = workingHours.getStartTime();
        LocalTime endOfDay = workingHours.getEndTime();

        while (currentSlot.plusMinutes(slotDurationMinutes).isBefore(endOfDay) ||
                currentSlot.plusMinutes(slotDurationMinutes).equals(endOfDay)) {

            LocalTime slotEnd = currentSlot.plusMinutes(slotDurationMinutes);
            boolean available = isTimeSlotAvailable(barberProfile, date, currentSlot, slotEnd);

            slots.add(new TimeSlot(currentSlot, slotEnd, available));
            currentSlot = slotEnd;
        }

        return slots;
    }

    /**
     * Value object representing a time slot with availability
     */
    public static class TimeSlot {
        private final LocalTime startTime;
        private final LocalTime endTime;
        private final boolean available;

        public TimeSlot(LocalTime startTime, LocalTime endTime, boolean available) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.available = available;
        }

        public LocalTime getStartTime() {
            return startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public boolean isAvailable() {
            return available;
        }
    }

    /**
     * Check if barber can accept a new appointment on the given date
     * (has at least one available slot)
     *
     * @param barberProfile The barber profile
     * @param date The date to check
     * @param slotDurationMinutes Minimum slot duration to check
     * @return true if at least one slot is available
     */
    public boolean hasAvailability(
            BarberProfile barberProfile,
            LocalDate date,
            int slotDurationMinutes
    ) {
        List<TimeSlot> slots = generateAvailableSlots(barberProfile, date, slotDurationMinutes);
        return slots.stream().anyMatch(TimeSlot::isAvailable);
    }

    /**
     * Validate that an appointment can be scheduled
     * Throws exception if validation fails
     *
     * @param barberProfile The barber profile
     * @param date The appointment date
     * @param startTime The start time
     * @param endTime The end time
     * @throws com.barber.exception.BadRequestException if slot is not available
     */
    public void validateAppointmentSlot(
            BarberProfile barberProfile,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {
        if (!isTimeSlotAvailable(barberProfile, date, startTime, endTime)) {
            throw new com.barber.exception.BadRequestException(
                    "Seçilen saat dolu veya çalışma saatleri dışında"
            );
        }
    }
}
