package com.barber.entity;

import com.barber.common.domain.valueobject.Money;
import com.barber.exception.BadRequestException;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Currency;

/**
 * ENTITY: Service
 *
 * Represents a service offered by a barber shop.
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
@Table(name = "services")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA only
@AllArgsConstructor(access = AccessLevel.PRIVATE) // For Builder only
@Builder // Public builder for Service
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barber_profile_id", nullable = false)
    private BarberProfile barberProfile;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ==================== PACKAGE-PRIVATE SETTERS ====================
    // Only BarberProfile (same package) can modify Service

    void setName(String name) {
        this.name = name;
    }

    void setDescription(String description) {
        this.description = description;
    }

    void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    void setPrice(BigDecimal price) {
        this.price = price;
    }

    void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    void setBarberProfile(BarberProfile barberProfile) {
        this.barberProfile = barberProfile;
    }

    // ==================== BUSINESS METHODS ====================

    /**
     * Get price as Money value object
     *
     * @return Money value object
     */
    public Money getPriceAsMoney() {
        return new Money(price, Currency.getInstance("TRY"));
    }

    /**
     * Check if service is currently active
     *
     * @return true if service is active
     */
    public boolean isCurrentlyActive() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Activate this service
     */
    void activate() {
        this.isActive = true;
    }

    /**
     * Deactivate this service
     */
    void deactivate() {
        this.isActive = false;
    }

    /**
     * Check if duration is valid
     *
     * @return true if duration is between 5 and 480 minutes
     */
    public boolean hasValidDuration() {
        return durationMinutes != null && durationMinutes >= 5 && durationMinutes <= 480;
    }

    /**
     * Check if price is valid
     *
     * @return true if price is positive
     */
    public boolean hasValidPrice() {
        return price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }

    // ==================== INVARIANT VALIDATION ====================

    /**
     * Validate service invariants
     * Called by BarberProfile before adding/updating
     *
     * @throws BadRequestException if any invariant is violated
     */
    void validateInvariants() {
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Hizmet adı boş olamaz");
        }

        if (name.length() > 255) {
            throw new BadRequestException("Hizmet adı 255 karakterden uzun olamaz");
        }

        if (!hasValidDuration()) {
            throw new BadRequestException("Hizmet süresi 5-480 dakika arasında olmalıdır");
        }

        if (!hasValidPrice()) {
            throw new BadRequestException("Hizmet fiyatı pozitif olmalıdır");
        }

        if (barberProfile == null) {
            throw new BadRequestException("Hizmet bir kuaför profiline ait olmalıdır");
        }
    }
}
