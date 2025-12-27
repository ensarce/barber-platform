package com.barber.entity;

import com.barber.common.domain.event.DomainEvent;
import com.barber.common.domain.event.ReviewSubmitted;
import com.barber.common.domain.valueobject.Rating;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ENTITY: Review
 *
 * Represents a customer review for a completed appointment.
 * Transitioning from anemic to rich domain model.
 *
 * Phase 1 Changes:
 * - Removed @Data (prevents direct field mutation)
 * - Made setters private/protected
 * - Added business methods
 * - Added domain event support
 *
 * Note: Still using JPA annotations (will be separated in Phase 2)
 */
@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA only
@AllArgsConstructor(access = AccessLevel.PRIVATE) // For Builder only
@Builder(access = AccessLevel.PUBLIC)
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barber_profile_id", nullable = false)
    private BarberProfile barberProfile;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;
    
    @Column(nullable = false)
    private Integer rating; // 1-5
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isVisible = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Domain events (not persisted)
    @Transient
    @Getter(AccessLevel.NONE)
    @Builder.Default
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ==================== BUSINESS METHODS ====================

    /**
     * Get rating as Rating value object
     *
     * @return Rating value object
     */
    public Rating getRatingValue() {
        return Rating.of(rating);
    }

    /**
     * Check if review is positive (4-5 stars)
     *
     * @return true if rating is 4 or 5
     */
    public boolean isPositive() {
        return rating >= 4;
    }

    /**
     * Check if review is negative (1-2 stars)
     *
     * @return true if rating is 1 or 2
     */
    public boolean isNegative() {
        return rating <= 2;
    }

    /**
     * Check if review is neutral (3 stars)
     *
     * @return true if rating is 3
     */
    public boolean isNeutral() {
        return rating == 3;
    }

    /**
     * Check if review has a comment
     *
     * @return true if comment is not null and not empty
     */
    public boolean hasComment() {
        return comment != null && !comment.trim().isEmpty();
    }

    /**
     * Hide the review from public view
     */
    public void hide() {
        this.isVisible = false;
    }

    /**
     * Show the review in public view
     */
    public void show() {
        this.isVisible = true;
    }

    /**
     * Mark review as submitted and register domain event
     */
    public void markAsSubmitted() {
        registerEvent(ReviewSubmitted.now(
            this.id,
            this.appointment.getId(),
            this.customer.getId(),
            this.barberProfile.getId(),
            Rating.of(this.rating)
        ));
    }

    // ==================== DOMAIN EVENTS ====================

    /**
     * Register a domain event to be published
     *
     * @param event The event to register
     */
    private void registerEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }

    /**
     * Get and clear all domain events (for publishing)
     *
     * @return List of domain events
     */
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }
}
