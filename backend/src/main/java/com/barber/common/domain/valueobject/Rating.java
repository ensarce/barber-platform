package com.barber.common.domain.valueobject;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * VALUE OBJECT: Rating
 *
 * Represents a rating value (1-5 stars).
 * Immutable and self-validating.
 *
 * Benefits:
 * - Enforces valid rating range (1-5)
 * - Type-safe: Cannot accidentally use invalid rating values
 * - Encapsulates rating comparison and interpretation logic
 * - Prevents primitive obsession
 */
@Getter
@EqualsAndHashCode
public class Rating {

    public static final int MIN_VALUE = 1;
    public static final int MAX_VALUE = 5;

    public static final Rating ONE_STAR = new Rating(1);
    public static final Rating TWO_STARS = new Rating(2);
    public static final Rating THREE_STARS = new Rating(3);
    public static final Rating FOUR_STARS = new Rating(4);
    public static final Rating FIVE_STARS = new Rating(5);

    private final int value;

    /**
     * Create a Rating
     *
     * @param value Rating value (must be between 1 and 5 inclusive)
     * @throws IllegalArgumentException if value is outside valid range
     */
    public Rating(int value) {
        if (value < MIN_VALUE || value > MAX_VALUE) {
            throw new IllegalArgumentException(
                String.format("Rating must be between %d and %d, got: %d",
                    MIN_VALUE, MAX_VALUE, value)
            );
        }
        this.value = value;
    }

    /**
     * Create a Rating from integer, using constants for common values
     */
    public static Rating of(int value) {
        return switch (value) {
            case 1 -> ONE_STAR;
            case 2 -> TWO_STARS;
            case 3 -> THREE_STARS;
            case 4 -> FOUR_STARS;
            case 5 -> FIVE_STARS;
            default -> throw new IllegalArgumentException(
                String.format("Rating must be between %d and %d, got: %d",
                    MIN_VALUE, MAX_VALUE, value)
            );
        };
    }

    /**
     * Check if this is a positive rating (4 or 5 stars)
     */
    public boolean isPositive() {
        return value >= 4;
    }

    /**
     * Check if this is a negative rating (1 or 2 stars)
     */
    public boolean isNegative() {
        return value <= 2;
    }

    /**
     * Check if this is a neutral rating (3 stars)
     */
    public boolean isNeutral() {
        return value == 3;
    }

    /**
     * Check if this is the maximum rating (5 stars)
     */
    public boolean isMaximum() {
        return value == MAX_VALUE;
    }

    /**
     * Check if this is the minimum rating (1 star)
     */
    public boolean isMinimum() {
        return value == MIN_VALUE;
    }

    /**
     * Compare to another rating
     *
     * @param other The rating to compare to
     * @return true if this rating is higher than the other
     */
    public boolean isHigherThan(Rating other) {
        return this.value > other.value;
    }

    /**
     * Compare to another rating
     *
     * @param other The rating to compare to
     * @return true if this rating is lower than the other
     */
    public boolean isLowerThan(Rating other) {
        return this.value < other.value;
    }

    /**
     * Get as percentage (20% per star)
     *
     * @return Percentage value (20-100)
     */
    public int asPercentage() {
        return value * 20;
    }

    /**
     * Get as decimal (0.2 per star)
     *
     * @return Decimal value (0.2-1.0)
     */
    public double asDecimal() {
        return value / 5.0;
    }

    /**
     * Get stars as string representation
     *
     * @return Star string (e.g., "★★★★☆" for 4 stars)
     */
    public String asStars() {
        return "★".repeat(value) + "☆".repeat(MAX_VALUE - value);
    }

    /**
     * Get description of the rating
     */
    public String getDescription() {
        return switch (value) {
            case 1 -> "Very Poor";
            case 2 -> "Poor";
            case 3 -> "Average";
            case 4 -> "Good";
            case 5 -> "Excellent";
            default -> "Unknown";
        };
    }

    /**
     * Calculate average rating from multiple ratings
     *
     * @param ratings Array of rating values
     * @return Average as double, or 0.0 if no ratings
     */
    public static double calculateAverage(int... ratings) {
        if (ratings == null || ratings.length == 0) {
            return 0.0;
        }

        int sum = 0;
        for (int rating : ratings) {
            // Validate each rating
            if (rating < MIN_VALUE || rating > MAX_VALUE) {
                throw new IllegalArgumentException(
                    String.format("Invalid rating in array: %d", rating)
                );
            }
            sum += rating;
        }

        return (double) sum / ratings.length;
    }

    /**
     * Round average to nearest rating
     *
     * @param average The average rating value
     * @return Rounded Rating
     */
    public static Rating roundFromAverage(double average) {
        if (average < MIN_VALUE) {
            return Rating.of(MIN_VALUE);
        }
        if (average > MAX_VALUE) {
            return Rating.of(MAX_VALUE);
        }
        return Rating.of((int) Math.round(average));
    }

    @Override
    public String toString() {
        return String.format("%d/5 (%s)", value, getDescription());
    }
}
