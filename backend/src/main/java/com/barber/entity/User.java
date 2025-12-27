package com.barber.entity;

import com.barber.common.domain.valueobject.Email;
import com.barber.common.domain.valueobject.PhoneNumber;
import com.barber.exception.BadRequestException;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ENTITY: User
 *
 * Represents a user account in the system.
 * AGGREGATE ROOT for User aggregate.
 *
 * Phase 2 Changes:
 * - Removed @Data (prevents direct field mutation)
 * - Made setters package-private or removed them
 * - Added business methods
 * - Added value objects for email and phone
 * - Added invariant validation
 *
 * Note: Still using JPA annotations (will be separated in Phase 3)
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA only
@AllArgsConstructor(access = AccessLevel.PRIVATE) // For Builder only
@Builder(access = AccessLevel.PUBLIC)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BarberProfile barberProfile;

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
     * Get email as Email value object
     *
     * @return Email value object
     */
    public Email getEmailValue() {
        return new Email(email);
    }

    /**
     * Get phone as PhoneNumber value object
     *
     * @return PhoneNumber value object (null if no phone)
     */
    public PhoneNumber getPhoneValue() {
        return phone != null ? new PhoneNumber(phone) : null;
    }

    /**
     * Check if user is a customer
     *
     * @return true if role is CUSTOMER
     */
    public boolean isCustomer() {
        return role == Role.CUSTOMER;
    }

    /**
     * Check if user is a barber
     *
     * @return true if role is BARBER
     */
    public boolean isBarber() {
        return role == Role.BARBER;
    }

    /**
     * Check if user is an admin
     *
     * @return true if role is ADMIN
     */
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    /**
     * Check if user has a barber profile
     *
     * @return true if barber profile exists
     */
    public boolean hasBarberProfile() {
        return barberProfile != null;
    }

    /**
     * Update user profile information
     *
     * @param name New name (optional)
     * @param phone New phone (optional)
     */
    public void updateProfile(String name, String phone) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name;
        }

        if (phone != null) {
            // Validate phone number if provided
            if (!phone.trim().isEmpty()) {
                new PhoneNumber(phone); // Will throw if invalid
                this.phone = phone;
            } else {
                this.phone = null;
            }
        }

        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Update password hash
     * Note: Password validation should be done before calling this
     *
     * @param newPasswordHash The new hashed password
     */
    public void updatePassword(String newPasswordHash) {
        if (newPasswordHash == null || newPasswordHash.trim().isEmpty()) {
            throw new BadRequestException("Şifre boş olamaz");
        }
        this.passwordHash = newPasswordHash;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Update email address
     *
     * @param newEmail The new email address
     */
    public void updateEmail(String newEmail) {
        // Validate email
        new Email(newEmail); // Will throw if invalid
        this.email = newEmail;
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== INVARIANT VALIDATION ====================

    /**
     * Validate user invariants
     *
     * @throws BadRequestException if any invariant is violated
     */
    public void validateInvariants() {
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("E-posta adresi boş olamaz");
        }

        // Validate email format
        new Email(email); // Will throw if invalid

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("İsim boş olamaz");
        }

        if (name.length() > 255) {
            throw new BadRequestException("İsim 255 karakterden uzun olamaz");
        }

        if (passwordHash == null || passwordHash.trim().isEmpty()) {
            throw new BadRequestException("Şifre boş olamaz");
        }

        if (role == null) {
            throw new BadRequestException("Kullanıcı rolü belirtilmelidir");
        }

        // Validate phone if provided
        if (phone != null && !phone.trim().isEmpty()) {
            new PhoneNumber(phone); // Will throw if invalid
        }

        // Business rule: Only barbers can have barber profiles
        if (barberProfile != null && role != Role.BARBER) {
            throw new BadRequestException("Sadece kuaförler barber profili oluşturabilir");
        }
    }
}
