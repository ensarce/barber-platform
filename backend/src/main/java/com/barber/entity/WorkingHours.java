package com.barber.entity;

import com.barber.exception.BadRequestException;
import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * ENTITY: WorkingHours
 *
 * Represents working hours for a specific day of the week.
 * Part of the BarberProfile aggregate.
 *
 * Phase 2 Changes:
 * - Removed @Data (prevents direct field mutation)
 * - Made setters package-private (only BarberProfile can modify)
 * - Added business methods
 * - Added invariant validation
 *
 * Note: This is NOT an aggregate root - it can only be modified through BarberProfile
 */
@Entity
@Table(name = "working_hours")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA only
@AllArgsConstructor(access = AccessLevel.PRIVATE) // For Builder only
@Builder // Public builder for WorkingHours
public class WorkingHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barber_profile_id", nullable = false)
    private BarberProfile barberProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    // ==================== PACKAGE-PRIVATE SETTERS ====================
    // Only BarberProfile (same package) can modify WorkingHours

    void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    void setIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
    }

    void setBarberProfile(BarberProfile barberProfile) {
        this.barberProfile = barberProfile;
    }

    // ==================== BUSINESS METHODS ====================

    /**
     * Check if shop is open on this day
     *
     * @return true if not closed
     */
    public boolean isOpen() {
        return !Boolean.TRUE.equals(isClosed);
    }

    /**
     * Check if shop is closed on this day
     *
     * @return true if closed
     */
    public boolean isClosed() {
        return Boolean.TRUE.equals(isClosed);
    }

    /**
     * Check if a given time is within working hours
     *
     * @param time Time to check
     * @return true if time is within working hours
     */
    public boolean isWithinWorkingHours(LocalTime time) {
        if (isClosed()) {
            return false;
        }

        if (startTime == null || endTime == null) {
            return false;
        }

        return !time.isBefore(startTime) && !time.isAfter(endTime);
    }

    /**
     * Check if a time range is within working hours
     *
     * @param start Start time
     * @param end End time
     * @return true if entire range is within working hours
     */
    public boolean isTimeRangeWithinWorkingHours(LocalTime start, LocalTime end) {
        if (isClosed()) {
            return false;
        }

        if (startTime == null || endTime == null) {
            return false;
        }

        return !start.isBefore(startTime) && !end.isAfter(endTime);
    }

    /**
     * Get the day name in Turkish
     *
     * @return Turkish name for the day
     */
    public String getDayNameTurkish() {
        return switch (dayOfWeek) {
            case MONDAY -> "Pazartesi";
            case TUESDAY -> "Salı";
            case WEDNESDAY -> "Çarşamba";
            case THURSDAY -> "Perşembe";
            case FRIDAY -> "Cuma";
            case SATURDAY -> "Cumartesi";
            case SUNDAY -> "Pazar";
        };
    }

    /**
     * Check if working hours are valid
     *
     * @return true if hours are properly configured
     */
    public boolean hasValidTimes() {
        if (isClosed()) {
            return true; // Closed days don't need valid times
        }

        if (startTime == null || endTime == null) {
            return false;
        }

        return startTime.isBefore(endTime);
    }

    // ==================== INVARIANT VALIDATION ====================

    /**
     * Validate working hours invariants
     * Called by BarberProfile before adding/updating
     *
     * @throws BadRequestException if any invariant is violated
     */
    void validateInvariants() {
        if (dayOfWeek == null) {
            throw new BadRequestException("Gün belirtilmelidir");
        }

        if (barberProfile == null) {
            throw new BadRequestException("Çalışma saatleri bir kuaför profiline ait olmalıdır");
        }

        // If not closed, times must be valid
        if (!isClosed()) {
            if (startTime == null || endTime == null) {
                throw new BadRequestException(
                    getDayNameTurkish() + " için başlangıç ve bitiş saati belirtilmelidir"
                );
            }

            if (!hasValidTimes()) {
                throw new BadRequestException(
                    getDayNameTurkish() + " için bitiş saati başlangıç saatinden sonra olmalıdır"
                );
            }

            // Business rule: working hours should be reasonable (at least 1 hour, max 24 hours)
            long hoursDiff = java.time.Duration.between(startTime, endTime).toHours();
            if (hoursDiff < 1) {
                throw new BadRequestException(
                    getDayNameTurkish() + " için çalışma süresi en az 1 saat olmalıdır"
                );
            }
        }
    }
}
