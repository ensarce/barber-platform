package com.barber.service;

import com.barber.dto.BarberDto;
import com.barber.dto.ReviewDto;
import com.barber.entity.BarberProfile;
import com.barber.entity.BarberStatus;
import com.barber.exception.ResourceNotFoundException;
import com.barber.repository.BarberProfileRepository;
import com.barber.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final BarberProfileRepository barberProfileRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    
    public List<BarberDto.BarberListResponse> getPendingBarbers() {
        return barberProfileRepository.findByStatusOrderByCreatedAtDesc(BarberStatus.PENDING)
            .stream()
            .map(this::mapToListResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public BarberDto.BarberListResponse approveBarber(Long barberProfileId) {
        BarberProfile profile = barberProfileRepository.findById(barberProfileId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));

        profile.approve();
        profile = barberProfileRepository.save(profile);

        return mapToListResponse(profile);
    }
    
    @Transactional
    public BarberDto.BarberListResponse rejectBarber(Long barberProfileId) {
        BarberProfile profile = barberProfileRepository.findById(barberProfileId)
            .orElseThrow(() -> new ResourceNotFoundException("Kuaför bulunamadı"));

        profile.reject();
        profile = barberProfileRepository.save(profile);

        return mapToListResponse(profile);
    }
    
    public Page<ReviewDto.ReviewResponse> getAllReviews(Long barberProfileId, Pageable pageable) {
        return reviewRepository.findByBarberProfileIdOrderByCreatedAtDesc(barberProfileId, pageable)
            .map(review -> {
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
            });
    }
    
    public ReviewDto.ReviewResponse updateReviewVisibility(Long reviewId, ReviewDto.UpdateVisibilityRequest request) {
        return reviewService.updateVisibility(reviewId, request);
    }
    
    private BarberDto.BarberListResponse mapToListResponse(BarberProfile profile) {
        BarberDto.BarberListResponse response = new BarberDto.BarberListResponse();
        response.setId(profile.getId());
        response.setShopName(profile.getShopName());
        response.setCity(profile.getCity());
        response.setDistrict(profile.getDistrict());
        response.setProfileImage(profile.getProfileImage());
        response.setAverageRating(profile.getAverageRating());
        response.setTotalReviews(profile.getTotalReviews());
        return response;
    }
}
