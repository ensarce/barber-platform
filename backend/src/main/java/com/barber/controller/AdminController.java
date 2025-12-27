package com.barber.controller;

import com.barber.dto.BarberDto;
import com.barber.dto.ReviewDto;
import com.barber.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Platform yönetimi (yalnızca admin)")
public class AdminController {
    
    private final AdminService adminService;
    
    @GetMapping("/barbers/pending")
    @Operation(summary = "Onay bekleyenler", description = "Onay bekleyen kuaförleri listele")
    public ResponseEntity<List<BarberDto.BarberListResponse>> getPendingBarbers() {
        return ResponseEntity.ok(adminService.getPendingBarbers());
    }
    
    @PatchMapping("/barbers/{id}/approve")
    @Operation(summary = "Kuaför onayla", description = "Kuaför profilini onayla")
    public ResponseEntity<BarberDto.BarberListResponse> approveBarber(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveBarber(id));
    }
    
    @PatchMapping("/barbers/{id}/reject")
    @Operation(summary = "Kuaför reddet", description = "Kuaför profilini reddet")
    public ResponseEntity<BarberDto.BarberListResponse> rejectBarber(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectBarber(id));
    }
    
    @GetMapping("/barbers/{barberProfileId}/reviews")
    @Operation(summary = "Tüm yorumlar", description = "Kuaförün tüm yorumlarını listele (gizli dahil)")
    public ResponseEntity<Page<ReviewDto.ReviewResponse>> getAllReviews(
            @PathVariable Long barberProfileId, Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllReviews(barberProfileId, pageable));
    }
    
    @PatchMapping("/reviews/{id}/visibility")
    @Operation(summary = "Yorum görünürlüğü", description = "Yorum görünürlüğünü değiştir")
    public ResponseEntity<ReviewDto.ReviewResponse> updateReviewVisibility(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDto.UpdateVisibilityRequest request) {
        return ResponseEntity.ok(adminService.updateReviewVisibility(id, request));
    }
}
