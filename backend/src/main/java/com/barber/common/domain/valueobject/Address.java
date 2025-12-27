package com.barber.common.domain.valueobject;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * VALUE OBJECT: Address
 *
 * Represents a physical address with optional coordinates.
 * Immutable and self-validating.
 *
 * Benefits:
 * - Groups related address fields into a single cohesive concept
 * - Prevents invalid addresses (e.g., null street or city)
 * - Encapsulates address validation logic
 * - Type-safe: Cannot accidentally swap street and city
 */
@Getter
@EqualsAndHashCode
public class Address {

    private final String street;
    private final String city;
    private final String district;
    private final Coordinates coordinates;

    /**
     * Create an Address with coordinates
     *
     * @param street The street address (cannot be null or blank)
     * @param city The city (cannot be null or blank)
     * @param district The district (cannot be null or blank)
     * @param latitude Geographic latitude
     * @param longitude Geographic longitude
     * @throws IllegalArgumentException if validation fails
     */
    public Address(String street, String city, String district, Double latitude, Double longitude) {
        this.street = validateNotBlank(street, "Street");
        this.city = validateNotBlank(city, "City");
        this.district = validateNotBlank(district, "District");
        this.coordinates = (latitude != null && longitude != null)
            ? new Coordinates(latitude, longitude)
            : null;
    }

    /**
     * Create an Address without coordinates
     */
    public Address(String street, String city, String district) {
        this(street, city, district, null, null);
    }

    /**
     * Check if this address has coordinates
     */
    public boolean hasCoordinates() {
        return coordinates != null;
    }

    /**
     * Get latitude (null if no coordinates)
     */
    public Double getLatitude() {
        return coordinates != null ? coordinates.getLatitude() : null;
    }

    /**
     * Get longitude (null if no coordinates)
     */
    public Double getLongitude() {
        return coordinates != null ? coordinates.getLongitude() : null;
    }

    /**
     * Get full address as formatted string
     */
    public String getFullAddress() {
        return String.format("%s, %s, %s", street, district, city);
    }

    /**
     * Calculate distance to another address (if both have coordinates)
     *
     * @param other The other address
     * @return Distance in kilometers, or null if either address lacks coordinates
     */
    public Double distanceToInKm(Address other) {
        if (!this.hasCoordinates() || !other.hasCoordinates()) {
            return null;
        }
        return this.coordinates.distanceToInKm(other.coordinates);
    }

    /**
     * Check if address is in the same city
     */
    public boolean isSameCityAs(Address other) {
        return this.city.equalsIgnoreCase(other.city);
    }

    /**
     * Check if address is in the same district
     */
    public boolean isSameDistrictAs(Address other) {
        return this.city.equalsIgnoreCase(other.city) &&
               this.district.equalsIgnoreCase(other.district);
    }

    private String validateNotBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be null or blank");
        }
        return value.trim();
    }

    @Override
    public String toString() {
        if (hasCoordinates()) {
            return String.format("%s, %s, %s (%.6f, %.6f)",
                street, district, city,
                coordinates.getLatitude(), coordinates.getLongitude());
        }
        return getFullAddress();
    }

    /**
     * VALUE OBJECT: Coordinates
     *
     * Represents geographic coordinates (latitude/longitude)
     */
    @Getter
    @EqualsAndHashCode
    public static class Coordinates {
        private final double latitude;
        private final double longitude;

        public Coordinates(double latitude, double longitude) {
            if (latitude < -90 || latitude > 90) {
                throw new IllegalArgumentException("Latitude must be between -90 and 90");
            }
            if (longitude < -180 || longitude > 180) {
                throw new IllegalArgumentException("Longitude must be between -180 and 180");
            }
            this.latitude = latitude;
            this.longitude = longitude;
        }

        /**
         * Calculate distance to another coordinate using Haversine formula
         *
         * @param other The other coordinates
         * @return Distance in kilometers
         */
        public double distanceToInKm(Coordinates other) {
            final int EARTH_RADIUS_KM = 6371;

            double lat1Rad = Math.toRadians(this.latitude);
            double lat2Rad = Math.toRadians(other.latitude);
            double deltaLatRad = Math.toRadians(other.latitude - this.latitude);
            double deltaLonRad = Math.toRadians(other.longitude - this.longitude);

            double a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
                      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                      Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return EARTH_RADIUS_KM * c;
        }

        @Override
        public String toString() {
            return String.format("(%.6f, %.6f)", latitude, longitude);
        }
    }
}
