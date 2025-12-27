package com.barber.entity;

import com.barber.common.domain.event.*;
import com.barber.common.domain.valueobject.ScheduledTimeSlot;
import com.barber.exception.BadRequestException;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ENTITY: Appointment
 *
 * Represents a scheduled appointment between a customer and a barber.
 * Transitioning from anemic to rich domain model.
 *
 * Phase 1 Changes:
 * - Removed @Data (prevents direct field mutation)
 * - Added business methods for state transitions
 * - Added domain event registration
 * - Added invariant validation
 *
 * Note: Still using JPA annotations (will be separated in Phase 2)
 */
@Entity
@Table(name = "appointments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA only
@AllArgsConstructor(access = AccessLevel.PRIVATE) // For Builder only
@Builder(access = AccessLevel.PUBLIC)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barber_profile_id", nullable = false)
    private BarberProfile barberProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Review review;

    // Domain events (not persisted)
    @Transient
    @Getter(AccessLevel.NONE)
    @Builder.Default
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==================== BUSINESS METHODS ====================

    /**
     * Get the scheduled time slot as a value object
     *
     * @return ScheduledTimeSlot value object
     */
    public ScheduledTimeSlot getTimeSlot() {
        return new ScheduledTimeSlot(appointmentDate, startTime, endTime);
    }

    /**
     * Check if appointment can be cancelled
     *
     * @return true if cancellation is allowed
     */
    public boolean canBeCancelled() {
        return status != AppointmentStatus.CANCELLED &&
               status != AppointmentStatus.COMPLETED;
    }

    /**
     * Check if appointment can be confirmed
     *
     * @return true if confirmation is allowed
     */
    public boolean canBeConfirmed() {
        return status == AppointmentStatus.PENDING;
    }

    /**
     * Check if appointment can be completed
     *
     * @return true if completion is allowed
     */
    public boolean canBeCompleted() {
        return status == AppointmentStatus.CONFIRMED &&
               !getTimeSlot().isInFuture();
    }

    /**
     * Check if appointment can be reviewed
     *
     * @return true if a review can be submitted
     */
    public boolean canBeReviewed() {
        return status == AppointmentStatus.COMPLETED && review == null;
    }

    /**
     * Check if user has permission to cancel this appointment
     *
     * @param userId The user ID attempting to cancel
     * @return true if user can cancel
     */
    public boolean canBeCancelledBy(Long userId) {
        if (userId == null) {
            return false;
        }
        return customer.getId().equals(userId) ||
               barberProfile.getUser().getId().equals(userId);
    }

    /**
     * Check if appointment is active (not cancelled or completed)
     *
     * @return true if appointment is active
     */
    public boolean isActive() {
        return status != AppointmentStatus.CANCELLED &&
               status != AppointmentStatus.COMPLETED;
    }

    /**
     * Check if appointment is in the past
     *
     * @return true if appointment date/time has passed
     */
    public boolean isInPast() {
        return getTimeSlot().isInPast();
    }

    /**
     * Confirm the appointment (barber action)
     *
     * @throws BadRequestException if appointment cannot be confirmed
     */
    public void confirm() {
        if (!canBeConfirmed()) {
            throw new BadRequestException(
                "Randevu onaylanamaz. Mevcut durum: " + status
            );
        }

        this.status = AppointmentStatus.CONFIRMED;
        this.updatedAt = LocalDateTime.now();

        registerEvent(new AppointmentScheduled(
            this.id,
            this.customer.getId(),
            this.barberProfile.getId(),
            getTimeSlot(),
            LocalDateTime.now()
        ));
    }

    /**
     * Cancel the appointment
     *
     * @param userId User ID performing the cancellation
     * @param reason Optional cancellation reason
     * @throws BadRequestException if appointment cannot be cancelled
     */
    public void cancel(Long userId, String reason) {
        if (!canBeCancelled()) {
            throw new BadRequestException(
                "Randevu iptal edilemez. Mevcut durum: " + status
            );
        }

        if (!canBeCancelledBy(userId)) {
            throw new BadRequestException(
                "Bu randevuyu iptal etme yetkiniz yok"
            );
        }

        this.status = AppointmentStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();

        registerEvent(AppointmentCancelled.now(
            this.id,
            userId,
            reason
        ));
    }

    /**
     * Mark appointment as completed
     *
     * @throws BadRequestException if appointment cannot be completed
     */
    public void complete() {
        if (!canBeCompleted()) {
            throw new BadRequestException(
                "Randevu tamamlanamaz. Mevcut durum: " + status
            );
        }

        this.status = AppointmentStatus.COMPLETED;
        this.updatedAt = LocalDateTime.now();

        registerEvent(AppointmentCompleted.now(
            this.id,
            this.customer.getId(),
            this.barberProfile.getId()
        ));
    }

    /**
     * Update status with permission check
     *
     * @param newStatus The new status
     * @param userId User ID performing the update
     * @param isBarber Whether the user is the barber
     * @param isCustomer Whether the user is the customer
     * @throws BadRequestException if status transition is not allowed
     */
    public void updateStatus(AppointmentStatus newStatus, Long userId, boolean isBarber, boolean isCustomer) {
        // Customers can only cancel
        if (isCustomer && newStatus != AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Müşteriler sadece randevuyu iptal edebilir");
        }

        // Cannot change finalized appointments
        if (status == AppointmentStatus.CANCELLED || status == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Bu randevu zaten tamamlanmış veya iptal edilmiş");
        }

        // Perform the appropriate action based on new status
        switch (newStatus) {
            case CONFIRMED:
                if (!isBarber) {
                    throw new BadRequestException("Sadece kuaför randevuyu onaylayabilir");
                }
                confirm();
                break;

            case CANCELLED:
                cancel(userId, null);
                break;

            case COMPLETED:
                if (!isBarber) {
                    throw new BadRequestException("Sadece kuaför randevuyu tamamlayabilir");
                }
                complete();
                break;

            default:
                this.status = newStatus;
                this.updatedAt = LocalDateTime.now();
        }
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

    // ==================== INVARIANT VALIDATION ====================

    /**
     * Validate appointment invariants (called before creation)
     *
     * @throws BadRequestException if any invariant is violated
     */
    public void validateInvariants() {
        // Cannot book in the past
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Geçmiş bir tarihe randevu oluşturulamaz");
        }

        // End time must be after start time
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new BadRequestException("Bitiş zamanı başlangıç zamanından sonra olmalıdır");
        }

        // Barber must be approved
        if (barberProfile.getStatus() != BarberStatus.APPROVED) {
            throw new BadRequestException("Bu kuaför şu anda randevu almıyor");
        }

        // Cannot book at own shop
        if (barberProfile.getUser().getId().equals(customer.getId())) {
            throw new BadRequestException("Kendi dükkanınıza randevu oluşturamazsınız");
        }

        // Service must belong to barber
        if (!service.getBarberProfile().getId().equals(barberProfile.getId())) {
            throw new BadRequestException("Bu hizmet bu kuaföre ait değil");
        }

        // Price must be positive
        if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Fiyat pozitif olmalıdır");
        }
    }
}
