package com.barber.common.domain.event;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * DOMAIN EVENT: AppointmentCompleted
 *
 * Published when an appointment is marked as completed.
 * This event is significant because:
 * - It enables the customer to submit a review
 * - It triggers potential follow-up actions (request feedback, loyalty points, etc.)
 * - It updates analytics and statistics
 *
 * Event Data:
 * - appointmentId: The ID of the completed appointment
 * - customerId: Customer who attended the appointment
 * - barberProfileId: Barber who provided the service
 * - occurredOn: When the appointment was marked as completed
 */
@Getter
@ToString
@EqualsAndHashCode
public class AppointmentCompleted implements DomainEvent {

    private final Long appointmentId;
    private final Long customerId;
    private final Long barberProfileId;
    private final LocalDateTime occurredOn;

    public AppointmentCompleted(
            Long appointmentId,
            Long customerId,
            Long barberProfileId,
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

        this.appointmentId = appointmentId;
        this.customerId = customerId;
        this.barberProfileId = barberProfileId;
        this.occurredOn = occurredOn != null ? occurredOn : LocalDateTime.now();
    }

    /**
     * Factory method for creating event
     */
    public static AppointmentCompleted now(
            Long appointmentId,
            Long customerId,
            Long barberProfileId
    ) {
        return new AppointmentCompleted(
            appointmentId,
            customerId,
            barberProfileId,
            LocalDateTime.now()
        );
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
}
