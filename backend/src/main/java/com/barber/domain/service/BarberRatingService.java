package com.barber.domain.service;

import com.barber.entity.BarberProfile;
import com.barber.entity.Review;
import com.barber.exception.ResourceNotFoundException;
import com.barber.repository.BarberProfileRepository;
import com.barber.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * DOMAIN SERVICE: BarberRatingService
 *
 * Handles business logic for calculating and updating barber ratings.
 * This is a domain service because:
 * 1. It coordinates between Review and BarberProfile aggregates
 * 2. It encapsulates the business rule for rating calculation
 * 3. It represents a domain concept (rating management)
 *
 * Domain services are stateless and focus on domain logic.
 */
@Service
@RequiredArgsConstructor
public class BarberRatingService {

    private final ReviewRepository reviewRepository;
    private final BarberProfileRepository barberProfileRepository;

    /**
     * Recalculate and update the rating for a barber profile
     * This should be called whenever:
     * - A new review is submitted
     * - A review visibility changes
     * - A review is deleted
     *
     * @param barberProfileId The barber profile to update
     */
    @Transactional
    public void recalculateRating(Long barberProfileId) {
        BarberProfile profile = barberProfileRepository.findById(barberProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));

        // Calculate new rating based on visible reviews
        Double averageRating = reviewRepository.calculateAverageRating(barberProfileId);
        Integer totalReviews = reviewRepository.countVisibleReviews(barberProfileId);

        // Use aggregate method to update rating
        profile.updateRating(averageRating, totalReviews);

        barberProfileRepository.save(profile);
    }

    /**
     * Calculate the average rating from a list of reviews
     * This is a pure domain calculation
     *
     * @param reviews List of reviews to calculate from
     * @return Average rating, or 0.0 if no reviews
     */
    public Double calculateAverageRating(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return 0.0;
        }

        // Only consider visible reviews
        List<Review> visibleReviews = reviews.stream()
                .filter(Review::getIsVisible)
                .toList();

        if (visibleReviews.isEmpty()) {
            return 0.0;
        }

        double sum = visibleReviews.stream()
                .mapToInt(Review::getRating)
                .sum();

        return sum / visibleReviews.size();
    }

    /**
     * Check if a barber has enough reviews to be considered "established"
     * Business rule: Need at least 5 reviews to be considered established
     *
     * @param barberProfile The barber profile to check
     * @return true if established (5+ reviews)
     */
    public boolean isEstablishedBarber(BarberProfile barberProfile) {
        return barberProfile.getTotalReviews() >= 5;
    }

    /**
     * Check if a barber has a high rating
     * Business rule: 4.0+ average rating is considered high
     *
     * @param barberProfile The barber profile to check
     * @return true if high rated
     */
    public boolean isHighRated(BarberProfile barberProfile) {
        return barberProfile.getAverageRating() >= 4.0;
    }

    /**
     * Check if a barber is top rated
     * Business rule: 4.5+ average with at least 10 reviews
     *
     * @param barberProfile The barber profile to check
     * @return true if top rated
     */
    public boolean isTopRated(BarberProfile barberProfile) {
        return barberProfile.getAverageRating() >= 4.5 &&
                barberProfile.getTotalReviews() >= 10;
    }

    /**
     * Get rating category for a barber
     *
     * @param barberProfile The barber profile
     * @return Rating category as string
     */
    public RatingCategory getRatingCategory(BarberProfile barberProfile) {
        if (barberProfile.getTotalReviews() == 0) {
            return RatingCategory.NEW;
        }

        if (isTopRated(barberProfile)) {
            return RatingCategory.TOP_RATED;
        }

        if (isHighRated(barberProfile)) {
            return RatingCategory.HIGH_RATED;
        }

        if (barberProfile.getAverageRating() >= 3.0) {
            return RatingCategory.GOOD;
        }

        if (barberProfile.getAverageRating() >= 2.0) {
            return RatingCategory.AVERAGE;
        }

        return RatingCategory.LOW_RATED;
    }

    /**
     * Rating categories for barbers
     */
    public enum RatingCategory {
        NEW("Yeni", "Henüz değerlendirme yok"),
        TOP_RATED("Çok Beğenilen", "4.5+ yıldız, 10+ değerlendirme"),
        HIGH_RATED("Beğenilen", "4.0+ yıldız"),
        GOOD("İyi", "3.0+ yıldız"),
        AVERAGE("Orta", "2.0-3.0 yıldız"),
        LOW_RATED("Düşük", "2.0'dan az");

        private final String displayName;
        private final String description;

        RatingCategory(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Validate that a review can impact the barber's rating
     * Business rules for review validity
     *
     * @param review The review to validate
     * @return true if review should count toward rating
     */
    public boolean isReviewValidForRating(Review review) {
        // Only visible reviews count
        if (!review.getIsVisible()) {
            return false;
        }

        // Rating must be in valid range (already enforced by Rating value object)
        if (review.getRating() < 1 || review.getRating() > 5) {
            return false;
        }

        // Appointment must be completed
        return review.getAppointment().getStatus() == com.barber.entity.AppointmentStatus.COMPLETED;
    }

    /**
     * Calculate rating trend
     * Compares recent reviews to overall average
     *
     * @param barberProfileId The barber profile ID
     * @param recentReviewsCount Number of recent reviews to consider
     * @return Positive number if trending up, negative if trending down
     */
    public Double calculateRatingTrend(Long barberProfileId, int recentReviewsCount) {
        BarberProfile profile = barberProfileRepository.findById(barberProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));

        List<Review> recentReviews = reviewRepository
                .findByBarberProfileIdAndIsVisibleTrueOrderByCreatedAtDesc(barberProfileId,
                        org.springframework.data.domain.PageRequest.of(0, recentReviewsCount))
                .getContent();

        if (recentReviews.isEmpty()) {
            return 0.0;
        }

        Double recentAverage = calculateAverageRating(recentReviews);
        Double overallAverage = profile.getAverageRating();

        return recentAverage - overallAverage;
    }
}
