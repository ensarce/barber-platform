package com.barber.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ENTITY: BarberProfile
 *
 * Represents a barber shop profile.
 * AGGREGATE ROOT for BarberProfile aggregate.
 *
 * Phase 1 Changes:
 * - Removed @Data (prevents direct field mutation)
 * - Made setters private/protected
 * - Added business methods
 *
 * Phase 2 Changes:
 * - Added aggregate management methods for Service and WorkingHours
 * - Enforces invariants across the aggregate
 * - Children can only be modified through this root
 *
 * Note: Still using JPA annotations (will be separated in Phase 3)
 */
@Entity
@Table(name = "barber_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA only
@AllArgsConstructor(access = AccessLevel.PRIVATE) // For Builder only
@Builder(access = AccessLevel.PUBLIC)
public class BarberProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(nullable = false)
    private String shopName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String address;
    
    @Column(nullable = false)
    private String city;
    
    @Column(nullable = false)
    private String district;
    
    private Double latitude;
    
    private Double longitude;
    
    private String profileImage;
    
    @Column(nullable = false)
    @Builder.Default
    private Double averageRating = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer totalReviews = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BarberStatus status = BarberStatus.PENDING;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "barberProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Service> services = new ArrayList<>();
    
    @OneToMany(mappedBy = "barberProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkingHours> workingHours = new ArrayList<>();
    
    @OneToMany(mappedBy = "barberProfile", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();
    
    @OneToMany(mappedBy = "barberProfile", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ==================== BUSINESS METHODS ====================

    /**
     * Check if barber profile is approved and can accept appointments
     *
     * @return true if profile is approved
     */
    public boolean isApproved() {
        return status == BarberStatus.APPROVED;
    }

    /**
     * Check if barber profile is pending approval
     *
     * @return true if profile is pending
     */
    public boolean isPending() {
        return status == BarberStatus.PENDING;
    }

    /**
     * Check if barber profile is rejected
     *
     * @return true if profile is rejected
     */
    public boolean isRejected() {
        return status == BarberStatus.REJECTED;
    }

    /**
     * Approve the barber profile
     */
    public void approve() {
        this.status = BarberStatus.APPROVED;
    }

    /**
     * Reject the barber profile
     */
    public void reject() {
        this.status = BarberStatus.REJECTED;
    }

    /**
     * Update the average rating and total reviews
     * This method should be called when a new review is submitted
     *
     * @param newAverageRating The new average rating
     * @param newTotalReviews The new total number of reviews
     */
    public void updateRating(Double newAverageRating, Integer newTotalReviews) {
        this.averageRating = newAverageRating != null ? newAverageRating : 0.0;
        this.totalReviews = newTotalReviews != null ? newTotalReviews : 0;
    }

    /**
     * Check if the barber has any services
     *
     * @return true if barber has at least one service
     */
    public boolean hasServices() {
        return services != null && !services.isEmpty();
    }

    /**
     * Check if the barber has working hours defined
     *
     * @return true if working hours are defined
     */
    public boolean hasWorkingHours() {
        return workingHours != null && !workingHours.isEmpty();
    }

    /**
     * Update profile details
     * Allows updating mutable profile information
     *
     * @param shopName Shop name (optional)
     * @param description Description (optional)
     * @param address Address (optional)
     * @param city City (optional)
     * @param district District (optional)
     * @param latitude Latitude (optional)
     * @param longitude Longitude (optional)
     * @param profileImage Profile image URL (optional)
     */
    public void updateProfileDetails(
            String shopName,
            String description,
            String address,
            String city,
            String district,
            Double latitude,
            Double longitude,
            String profileImage
    ) {
        if (shopName != null) this.shopName = shopName;
        if (description != null) this.description = description;
        if (address != null) this.address = address;
        if (city != null) this.city = city;
        if (district != null) this.district = district;
        if (latitude != null) this.latitude = latitude;
        if (longitude != null) this.longitude = longitude;
        if (profileImage != null) this.profileImage = profileImage;
    }

    // ==================== AGGREGATE MANAGEMENT - SERVICES ====================

    /**
     * Add a new service to this barber profile
     * Enforces aggregate invariants
     *
     * @param name Service name
     * @param description Service description
     * @param durationMinutes Duration in minutes
     * @param price Price in TRY
     * @return The created service
     * @throws com.barber.exception.BadRequestException if invariants are violated
     */
    public Service addService(String name, String description, Integer durationMinutes, java.math.BigDecimal price) {
        Service service = Service.builder()
            .barberProfile(this)
            .name(name)
            .description(description)
            .durationMinutes(durationMinutes)
            .price(price)
            .isActive(true)
            .build();

        // Validate before adding
        service.validateInvariants();

        this.services.add(service);
        return service;
    }

    /**
     * Update an existing service
     * Enforces aggregate invariants
     *
     * @param serviceId Service ID to update
     * @param name New name (optional)
     * @param description New description (optional)
     * @param durationMinutes New duration (optional)
     * @param price New price (optional)
     * @param isActive New active status (optional)
     * @return The updated service
     * @throws com.barber.exception.ResourceNotFoundException if service not found
     * @throws com.barber.exception.BadRequestException if invariants are violated
     */
    public Service updateService(Long serviceId, String name, String description,
                                 Integer durationMinutes, java.math.BigDecimal price, Boolean isActive) {
        Service service = findServiceById(serviceId)
            .orElseThrow(() -> new com.barber.exception.ResourceNotFoundException("Hizmet bulunamadı"));

        // Update fields
        if (name != null) service.setName(name);
        if (description != null) service.setDescription(description);
        if (durationMinutes != null) service.setDurationMinutes(durationMinutes);
        if (price != null) service.setPrice(price);
        if (isActive != null) service.setIsActive(isActive);

        // Validate after update
        service.validateInvariants();

        return service;
    }

    /**
     * Deactivate a service (soft delete)
     *
     * @param serviceId Service ID to deactivate
     * @throws com.barber.exception.ResourceNotFoundException if service not found
     */
    public void deactivateService(Long serviceId) {
        Service service = findServiceById(serviceId)
            .orElseThrow(() -> new com.barber.exception.ResourceNotFoundException("Hizmet bulunamadı"));
        service.deactivate();
    }

    /**
     * Activate a previously deactivated service
     *
     * @param serviceId Service ID to activate
     * @throws com.barber.exception.ResourceNotFoundException if service not found
     */
    public void activateService(Long serviceId) {
        Service service = findServiceById(serviceId)
            .orElseThrow(() -> new com.barber.exception.ResourceNotFoundException("Hizmet bulunamadı"));
        service.activate();
    }

    /**
     * Remove a service from this barber profile
     *
     * @param serviceId Service ID to remove
     * @throws com.barber.exception.ResourceNotFoundException if service not found
     */
    public void removeService(Long serviceId) {
        Service service = findServiceById(serviceId)
            .orElseThrow(() -> new com.barber.exception.ResourceNotFoundException("Hizmet bulunamadı"));
        this.services.remove(service);
    }

    /**
     * Find a service by ID within this aggregate
     *
     * @param serviceId Service ID
     * @return Optional of Service
     */
    public java.util.Optional<Service> findServiceById(Long serviceId) {
        return services.stream()
            .filter(s -> s.getId() != null && s.getId().equals(serviceId))
            .findFirst();
    }

    /**
     * Get all active services
     *
     * @return List of active services
     */
    public List<Service> getActiveServices() {
        return services.stream()
            .filter(Service::isCurrentlyActive)
            .toList();
    }

    // ==================== AGGREGATE MANAGEMENT - WORKING HOURS ====================

    /**
     * Set working hours for this barber profile
     * Replaces all existing working hours
     *
     * @param newWorkingHours List of working hours
     * @throws com.barber.exception.BadRequestException if invariants are violated
     */
    public void setWorkingHours(List<WorkingHours> newWorkingHours) {
        // Clear existing
        this.workingHours.clear();

        // Validate and add new ones
        for (WorkingHours wh : newWorkingHours) {
            wh.setBarberProfile(this);
            wh.validateInvariants();
            this.workingHours.add(wh);
        }

        // Ensure no duplicate days
        long uniqueDays = this.workingHours.stream()
            .map(WorkingHours::getDayOfWeek)
            .distinct()
            .count();

        if (uniqueDays != this.workingHours.size()) {
            throw new com.barber.exception.BadRequestException("Aynı gün için birden fazla çalışma saati tanımlanamaz");
        }
    }

    /**
     * Update working hours for a specific day
     *
     * @param dayOfWeek Day of week
     * @param startTime Start time (null if closed)
     * @param endTime End time (null if closed)
     * @param isClosed Whether the shop is closed on this day
     * @return The updated or created WorkingHours
     * @throws com.barber.exception.BadRequestException if invariants are violated
     */
    public WorkingHours updateWorkingHoursForDay(java.time.DayOfWeek dayOfWeek,
                                                 java.time.LocalTime startTime,
                                                 java.time.LocalTime endTime,
                                                 Boolean isClosed) {
        // Find existing or create new
        WorkingHours wh = workingHours.stream()
            .filter(w -> w.getDayOfWeek() == dayOfWeek)
            .findFirst()
            .orElseGet(() -> {
                WorkingHours newWh = WorkingHours.builder()
                    .barberProfile(this)
                    .dayOfWeek(dayOfWeek)
                    .build();
                this.workingHours.add(newWh);
                return newWh;
            });

        // Update fields
        wh.setStartTime(startTime);
        wh.setEndTime(endTime);
        wh.setIsClosed(isClosed != null ? isClosed : false);

        // Validate
        wh.validateInvariants();

        return wh;
    }

    /**
     * Get working hours for a specific day
     *
     * @param dayOfWeek Day of week
     * @return Optional of WorkingHours
     */
    public java.util.Optional<WorkingHours> getWorkingHoursForDay(java.time.DayOfWeek dayOfWeek) {
        return workingHours.stream()
            .filter(wh -> wh.getDayOfWeek() == dayOfWeek)
            .findFirst();
    }

    /**
     * Check if the barber is open on a specific day
     *
     * @param dayOfWeek Day of week
     * @return true if open on that day
     */
    public boolean isOpenOnDay(java.time.DayOfWeek dayOfWeek) {
        return getWorkingHoursForDay(dayOfWeek)
            .map(WorkingHours::isOpen)
            .orElse(false);
    }

    /**
     * Check if a time is within working hours for a specific day
     *
     * @param dayOfWeek Day of week
     * @param time Time to check
     * @return true if time is within working hours
     */
    public boolean isWithinWorkingHours(java.time.DayOfWeek dayOfWeek, java.time.LocalTime time) {
        return getWorkingHoursForDay(dayOfWeek)
            .map(wh -> wh.isWithinWorkingHours(time))
            .orElse(false);
    }

    // ==================== AGGREGATE INVARIANTS ====================

    /**
     * Validate aggregate-wide invariants
     * This should be called before approving a barber profile
     *
     * @throws com.barber.exception.BadRequestException if invariants are violated
     */
    public void validateAggregateInvariants() {
        // Must have at least one active service before approval
        if (status == BarberStatus.APPROVED && getActiveServices().isEmpty()) {
            throw new com.barber.exception.BadRequestException(
                "Profil onaylanmadan önce en az bir aktif hizmet tanımlanmalıdır"
            );
        }

        // Must have working hours defined before approval
        if (status == BarberStatus.APPROVED && !hasWorkingHours()) {
            throw new com.barber.exception.BadRequestException(
                "Profil onaylanmadan önce çalışma saatleri tanımlanmalıdır"
            );
        }

        // All services must be valid
        for (Service service : services) {
            service.validateInvariants();
        }

        // All working hours must be valid
        for (WorkingHours wh : workingHours) {
            wh.validateInvariants();
        }
    }
}
