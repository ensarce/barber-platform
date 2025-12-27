package com.barber.common.domain.event;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * DOMAIN EVENT: AppointmentCancelled
 *
 * Published when an appointment is cancelled.
 * Contains information about who cancelled and why.
 *
 * Event Data:
 * - appointmentId: The ID of the cancelled appointment
 * - cancelledBy: User ID who cancelled the appointment
 * - reason: Reason for cancellation (optional)
 * - occurredOn: When the cancellation occurred
 */
@Getter
@ToString
@EqualsAndHashCode
public class AppointmentCancelled implements DomainEvent {

    private final Long appointmentId;
    private final Long cancelledBy;
    private final String reason;
    private final LocalDateTime occurredOn;

    public AppointmentCancelled(
            Long appointmentId,
            Long cancelledBy,
            String reason,
            LocalDateTime occurredOn
    ) {
        if (appointmentId == null) {
            throw new IllegalArgumentException("Appointment ID cannot be null");
        }
        if (cancelledBy == null) {
            throw new IllegalArgumentException("Cancelled by user ID cannot be null");
        }

        this.appointmentId = appointmentId;
        this.cancelledBy = cancelledBy;
        this.reason = reason;
        this.occurredOn = occurredOn != null ? occurredOn : LocalDateTime.now();
    }

    /**
     * Factory method for creating event
     */
    public static AppointmentCancelled now(
            Long appointmentId,
            Long cancelledBy,
            String reason
    ) {
        return new AppointmentCancelled(
            appointmentId,
            cancelledBy,
            reason,
            LocalDateTime.now()
        );
    }

    /**
     * Check if a reason was provided
     */
    public boolean hasReason() {
        return reason != null && !reason.trim().isEmpty();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
}
