package com.barber.common.domain.event;

import com.barber.common.domain.valueobject.ScheduledTimeSlot;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * DOMAIN EVENT: AppointmentScheduled
 *
 * Published when a new appointment is scheduled.
 * Other contexts can react to this event (e.g., send notifications, update analytics).
 *
 * Event Data:
 * - appointmentId: The ID of the scheduled appointment
 * - customerId: Who scheduled the appointment
 * - barberProfileId: Which barber was booked
 * - timeSlot: When the appointment is scheduled
 * - occurredOn: When this event was created
 */
@Getter
@ToString
@EqualsAndHashCode
public class AppointmentScheduled implements DomainEvent {

    private final Long appointmentId;
    private final Long customerId;
    private final Long barberProfileId;
    private final ScheduledTimeSlot timeSlot;
    private final LocalDateTime occurredOn;

    public AppointmentScheduled(
            Long appointmentId,
            Long customerId,
            Long barberProfileId,
            ScheduledTimeSlot timeSlot,
            LocalDateTime occurredOn
    ) {
        if (appointmentId == null) {
            throw new IllegalArgumentException("Appointment ID cannot be null");
        }
        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        if (barberProfileId == null) {
            throw new IllegalArgumentException("Barber profile ID cannot be null");
        }
        if (timeSlot == null) {
            throw new IllegalArgumentException("Time slot cannot be null");
        }

        this.appointmentId = appointmentId;
        this.customerId = customerId;
        this.barberProfileId = barberProfileId;
        this.timeSlot = timeSlot;
        this.occurredOn = occurredOn != null ? occurredOn : LocalDateTime.now();
    }

    /**
     * Factory method for creating event
     */
    public static AppointmentScheduled now(
            Long appointmentId,
            Long customerId,
            Long barberProfileId,
            ScheduledTimeSlot timeSlot
    ) {
        return new AppointmentScheduled(
            appointmentId,
            customerId,
            barberProfileId,
            timeSlot,
            LocalDateTime.now()
        );
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
}
