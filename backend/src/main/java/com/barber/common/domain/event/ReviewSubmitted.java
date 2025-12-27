package com.barber.common.domain.event;

import com.barber.common.domain.valueobject.Rating;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * DOMAIN EVENT: ReviewSubmitted
 *
 * Published when a customer submits a review for a completed appointment.
 * This event triggers:
 * - Recalculation of barber's average rating
 * - Notification to barber about new review
 * - Analytics updates
 *
 * Event Data:
 * - reviewId: The ID of the submitted review
 * - appointmentId: The appointment being reviewed
 * - customerId: Customer who submitted the review
 * - barberProfileId: Barber being reviewed
 * - rating: The rating given (1-5)
 * - occurredOn: When the review was submitted
 */
@Getter
@ToString
@EqualsAndHashCode
public class ReviewSubmitted implements DomainEvent {

    private final Long reviewId;
    private final Long appointmentId;
    private final Long customerId;
    private final Long barberProfileId;
    private final Rating rating;
    private final LocalDateTime occurredOn;

    public ReviewSubmitted(
            Long reviewId,
            Long appointmentId,
            Long customerId,
            Long barberProfileId,
            Rating rating,
            LocalDateTime occurredOn
    ) {
        if (reviewId == null) {
            throw new IllegalArgumentException("Review ID cannot be null");
        }
        if (appointmentId == null) {
            throw new IllegalArgumentException("Appointment ID cannot be null");
        }
        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        if (barberProfileId == null) {
            throw new IllegalArgumentException("Barber profile ID cannot be null");
        }
        if (rating == null) {
            throw new IllegalArgumentException("Rating cannot be null");
        }

        this.reviewId = reviewId;
        this.appointmentId = appointmentId;
        this.customerId = customerId;
        this.barberProfileId = barberProfileId;
        this.rating = rating;
        this.occurredOn = occurredOn != null ? occurredOn : LocalDateTime.now();
    }

    /**
     * Factory method for creating event
     */
    public static ReviewSubmitted now(
            Long reviewId,
            Long appointmentId,
            Long customerId,
            Long barberProfileId,
            Rating rating
    ) {
        return new ReviewSubmitted(
            reviewId,
            appointmentId,
            customerId,
            barberProfileId,
            rating,
            LocalDateTime.now()
        );
    }

    /**
     * Check if this is a positive review
     */
    public boolean isPositive() {
        return rating.isPositive();
    }

    /**
     * Check if this is a negative review
     */
    public boolean isNegative() {
        return rating.isNegative();
    }

    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
}
