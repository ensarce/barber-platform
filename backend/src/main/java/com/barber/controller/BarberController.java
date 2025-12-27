package com.barber.controller;

import com.barber.dto.BarberDto;
import com.barber.dto.ReviewDto;
import com.barber.dto.ServiceDto;
import com.barber.dto.WorkingHoursDto;
import com.barber.security.CustomUserDetailsService;
import com.barber.service.BarberService;
import com.barber.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import java.util.List;

@RestController
@RequestMapping("/api/barbers")
@RequiredArgsConstructor
@Tag(name = "Kuaförler", description = "Kuaför listesi ve profil yönetimi")
public class BarberController {
    
    private final BarberService barberService;
    private final ReviewService reviewService;
    private final CustomUserDetailsService userDetailsService;
    
    // Public endpoints
    @GetMapping
    @Operation(summary = "Kuaför listesi", description = "Onaylı kuaförleri listele")
    public ResponseEntity<Page<BarberDto.BarberListResponse>> getBarbers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @PageableDefault(size = 10, sort = "averageRating", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(barberService.getApprovedBarbers(city, district, pageable));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Kuaför detayı", description = "Kuaför profil detaylarını getir")
    public ResponseEntity<BarberDto.BarberDetailResponse> getBarber(@PathVariable Long id) {
        return ResponseEntity.ok(barberService.getBarberById(id));
    }
    
    @GetMapping("/{id}/services")
    @Operation(summary = "Kuaför hizmetleri", description = "Kuaförün sunduğu hizmetleri listele")
    public ResponseEntity<List<ServiceDto.ServiceResponse>> getBarberServices(@PathVariable Long id) {
        return ResponseEntity.ok(barberService.getServices(id));
    }
    
    @GetMapping("/{id}/reviews")
    @Operation(summary = "Kuaför yorumları", description = "Kuaför değerlendirmelerini listele")
    public ResponseEntity<Page<ReviewDto.ReviewResponse>> getBarberReviews(
            @PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(reviewService.getBarberReviews(id, pageable));
    }
    
    @GetMapping("/{id}/working-hours")
    @Operation(summary = "Çalışma saatleri", description = "Kuaförün çalışma saatlerini getir")
    public ResponseEntity<List<WorkingHoursDto.WorkingHoursResponse>> getWorkingHours(@PathVariable Long id) {
        return ResponseEntity.ok(barberService.getWorkingHours(id));
    }
    
    // Barber-only endpoints
    @PostMapping("/profile")
    @Operation(summary = "Profil oluştur", description = "Kuaför profili oluştur")
    public ResponseEntity<BarberDto.BarberDetailResponse> createProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BarberDto.CreateProfileRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(barberService.createProfile(userId, request));
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Profil güncelle", description = "Kuaför profilini güncelle")
    public ResponseEntity<BarberDto.BarberDetailResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BarberDto.UpdateProfileRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(barberService.updateProfile(userId, request));
    }
    
    @GetMapping("/profile/me")
    @Operation(summary = "Kendi profilim", description = "Giriş yapmış kuaförün profilini getir")
    public ResponseEntity<BarberDto.BarberDetailResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(barberService.getBarberByUserId(userId));
    }
    
    // Service management
    @PostMapping("/services")
    @Operation(summary = "Hizmet ekle", description = "Yeni hizmet ekle")
    public ResponseEntity<ServiceDto.ServiceResponse> addService(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ServiceDto.CreateServiceRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(barberService.addService(userId, request));
    }
    
    @PutMapping("/services/{serviceId}")
    @Operation(summary = "Hizmet güncelle", description = "Hizmet bilgilerini güncelle")
    public ResponseEntity<ServiceDto.ServiceResponse> updateService(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long serviceId,
            @Valid @RequestBody ServiceDto.UpdateServiceRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(barberService.updateService(userId, serviceId, request));
    }
    
    @DeleteMapping("/services/{serviceId}")
    @Operation(summary = "Hizmet sil", description = "Hizmeti kaldır")
    public ResponseEntity<Void> deleteService(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long serviceId) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        barberService.deleteService(userId, serviceId);
        return ResponseEntity.noContent().build();
    }
    
    // Working hours management
    @PutMapping("/working-hours")
    @Operation(summary = "Çalışma saatleri güncelle", description = "Haftalık çalışma saatlerini ayarla")
    public ResponseEntity<List<WorkingHoursDto.WorkingHoursResponse>> updateWorkingHours(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WorkingHoursDto.BulkWorkingHoursRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(barberService.updateWorkingHours(userId, request));
    }
}
