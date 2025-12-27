package com.barber.controller;

import com.barber.dto.ReviewDto;
import com.barber.security.CustomUserDetailsService;
import com.barber.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Değerlendirmeler", description = "Kuaför değerlendirme işlemleri")
public class ReviewController {
    
    private final ReviewService reviewService;
    private final CustomUserDetailsService userDetailsService;
    
    @PostMapping
    @Operation(summary = "Değerlendir", description = "Tamamlanan randevuyu değerlendir")
    public ResponseEntity<ReviewDto.ReviewResponse> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewDto.CreateReviewRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(reviewService.createReview(userId, request));
    }
}
