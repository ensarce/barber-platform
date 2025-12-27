package com.barber.common.domain.valueobject;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * VALUE OBJECT: ScheduledTimeSlot
 *
 * Immutable representation of a scheduled time slot with validation.
 * Encapsulates the date and time range for an appointment.
 *
 * Benefits:
 * - Prevents invalid time slots (e.g., end time before start time)
 * - Encapsulates time slot comparison logic (overlaps, contains, etc.)
 * - Type-safe: Cannot accidentally swap date and time values
 * - Business operations: duration calculation, overlap detection
 */
@Getter
@EqualsAndHashCode
public class ScheduledTimeSlot {

    private final LocalDate date;
    private final LocalTime startTime;
    private final LocalTime endTime;

    /**
     * Create a ScheduledTimeSlot
     *
     * @param date The date (cannot be null)
     * @param startTime The start time (cannot be null)
     * @param endTime The end time (cannot be null, must be after start time)
     * @throws IllegalArgumentException if validation fails
     */
    public ScheduledTimeSlot(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        if (startTime == null) {
            throw new IllegalArgumentException("Start time cannot be null");
        }
        if (endTime == null) {
            throw new IllegalArgumentException("End time cannot be null");
        }

        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new IllegalArgumentException(
                String.format("End time (%s) must be after start time (%s)", endTime, startTime)
            );
        }

        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    /**
     * Create a time slot from start time and duration
     *
     * @param date The date
     * @param startTime The start time
     * @param durationMinutes Duration in minutes
     * @return New ScheduledTimeSlot
     */
    public static ScheduledTimeSlot fromDuration(LocalDate date, LocalTime startTime, int durationMinutes) {
        if (durationMinutes <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        LocalTime endTime = startTime.plusMinutes(durationMinutes);
        return new ScheduledTimeSlot(date, startTime, endTime);
    }

    /**
     * Calculate duration in minutes
     *
     * @return Duration in minutes
     */
    public int durationInMinutes() {
        return (int) Duration.between(startTime, endTime).toMinutes();
    }

    /**
     * Get the start as LocalDateTime
     */
    public LocalDateTime getStartDateTime() {
        return LocalDateTime.of(date, startTime);
    }

    /**
     * Get the end as LocalDateTime
     */
    public LocalDateTime getEndDateTime() {
        return LocalDateTime.of(date, endTime);
    }

    /**
     * Check if this time slot is in the past
     *
     * @return true if the start time has passed
     */
    public boolean isInPast() {
        return getStartDateTime().isBefore(LocalDateTime.now());
    }

    /**
     * Check if this time slot is in the future
     *
     * @return true if the start time hasn't occurred yet
     */
    public boolean isInFuture() {
        return getStartDateTime().isAfter(LocalDateTime.now());
    }

    /**
     * Check if this time slot is today
     *
     * @return true if the date is today
     */
    public boolean isToday() {
        return date.equals(LocalDate.now());
    }

    /**
     * Check if this time slot is currently active
     *
     * @return true if current time is within this time slot
     */
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return !getStartDateTime().isAfter(now) && !getEndDateTime().isBefore(now);
    }

    /**
     * Check if this time slot overlaps with another
     *
     * Two time slots overlap if they are on the same date and their time ranges intersect.
     *
     * @param other The other time slot
     * @return true if there is any overlap
     */
    public boolean overlapsWith(ScheduledTimeSlot other) {
        if (!this.date.equals(other.date)) {
            return false;
        }

        // No overlap if one ends before the other starts
        return !(this.endTime.isBefore(other.startTime) ||
                 this.endTime.equals(other.startTime) ||
                 this.startTime.isAfter(other.endTime) ||
                 this.startTime.equals(other.endTime));
    }

    /**
     * Check if this time slot completely contains another
     *
     * @param other The other time slot
     * @return true if this slot completely contains the other
     */
    public boolean contains(ScheduledTimeSlot other) {
        if (!this.date.equals(other.date)) {
            return false;
        }

        return !this.startTime.isAfter(other.startTime) &&
               !this.endTime.isBefore(other.endTime);
    }

    /**
     * Check if this time slot falls within working hours
     *
     * @param workingStart Working hours start time
     * @param workingEnd Working hours end time
     * @return true if completely within working hours
     */
    public boolean isWithinWorkingHours(LocalTime workingStart, LocalTime workingEnd) {
        return !this.startTime.isBefore(workingStart) &&
               !this.endTime.isAfter(workingEnd);
    }

    /**
     * Check if this time slot is on a specific date
     */
    public boolean isOnDate(LocalDate date) {
        return this.date.equals(date);
    }

    /**
     * Get time until slot starts (in minutes)
     *
     * @return Minutes until start, or negative if already started
     */
    public long minutesUntilStart() {
        return Duration.between(LocalDateTime.now(), getStartDateTime()).toMinutes();
    }

    /**
     * Check if the slot is within a certain number of hours from now
     *
     * @param hours Number of hours
     * @return true if slot starts within the specified hours
     */
    public boolean startsWithinHours(int hours) {
        long minutesUntil = minutesUntilStart();
        return minutesUntil >= 0 && minutesUntil <= (hours * 60);
    }

    /**
     * Create a new time slot shifted by minutes
     *
     * @param minutes Minutes to shift (positive for future, negative for past)
     * @return New ScheduledTimeSlot
     */
    public ScheduledTimeSlot shiftByMinutes(int minutes) {
        LocalDateTime newStart = getStartDateTime().plusMinutes(minutes);
        LocalDateTime newEnd = getEndDateTime().plusMinutes(minutes);
        return new ScheduledTimeSlot(newStart.toLocalDate(), newStart.toLocalTime(), newEnd.toLocalTime());
    }

    @Override
    public String toString() {
        return String.format("%s %s-%s (%d min)",
            date, startTime, endTime, durationInMinutes());
    }
}
