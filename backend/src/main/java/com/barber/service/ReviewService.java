package com.barber.service;

import com.barber.dto.ReviewDto;
import com.barber.entity.*;
import com.barber.exception.BadRequestException;
import com.barber.exception.ResourceNotFoundException;
import com.barber.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final UserRepository userRepository;
    private final com.barber.domain.service.BarberRatingService ratingService;
    private final com.barber.common.infrastructure.event.DomainEventPublisher eventPublisher;
    
    @Transactional
    public ReviewDto.ReviewResponse createReview(Long customerId, ReviewDto.CreateReviewRequest request) {
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Randevu bulunamadı"));
        
        // Validate
        if (!appointment.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("Bu randevuyu değerlendirme yetkiniz yok");
        }
        
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Sadece tamamlanmış randevular değerlendirilebilir");
        }
        
        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new BadRequestException("Bu randevu zaten değerlendirilmiş");
        }
        
        Review review = Review.builder()
            .customer(customer)
            .barberProfile(appointment.getBarberProfile())
            .appointment(appointment)
            .rating(request.getRating())
            .comment(request.getComment())
            .build();
        
        // Mark as submitted to trigger domain events
        review.markAsSubmitted();

        review = reviewRepository.save(review);

        // Publish domain events
        eventPublisher.publishAll(review.pullDomainEvents());

        // Use domain service to recalculate rating
        ratingService.recalculateRating(appointment.getBarberProfile().getId());

        return mapToResponse(review);
    }
    
    public Page<ReviewDto.ReviewResponse> getBarberReviews(Long barberProfileId, Pageable pageable) {
        return reviewRepository.findByBarberProfileIdAndIsVisibleTrueOrderByCreatedAtDesc(barberProfileId, pageable)
            .map(this::mapToResponse);
    }
    
    @Transactional
    public ReviewDto.ReviewResponse updateVisibility(Long reviewId, ReviewDto.UpdateVisibilityRequest request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Değerlendirme bulunamadı"));

        if (request.getIsVisible()) {
            review.show();
        } else {
            review.hide();
        }
        review = reviewRepository.save(review);

        // Use domain service to recalculate rating
        ratingService.recalculateRating(review.getBarberProfile().getId());

        return mapToResponse(review);
    }
    
    // Removed: updateBarberRating - Now using BarberRatingService domain service

    private ReviewDto.ReviewResponse mapToResponse(Review review) {
        ReviewDto.ReviewResponse response = new ReviewDto.ReviewResponse();
        response.setId(review.getId());
        response.setCustomerId(review.getCustomer().getId());
        response.setCustomerName(review.getCustomer().getName());
        response.setBarberProfileId(review.getBarberProfile().getId());
        response.setAppointmentId(review.getAppointment().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setIsVisible(review.getIsVisible());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
