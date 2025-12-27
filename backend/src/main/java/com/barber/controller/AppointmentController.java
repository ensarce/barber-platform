package com.barber.controller;

import com.barber.dto.AppointmentDto;
import com.barber.entity.Role;
import com.barber.security.CustomUserDetailsService;
import com.barber.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Randevular", description = "Randevu oluşturma ve yönetimi")
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    private final CustomUserDetailsService userDetailsService;
    
    @PostMapping
    @Operation(summary = "Randevu oluştur", description = "Yeni randevu oluştur")
    public ResponseEntity<AppointmentDto.AppointmentResponse> createAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AppointmentDto.CreateAppointmentRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(appointmentService.createAppointment(userId, request));
    }
    
    @GetMapping
    @Operation(summary = "Randevularım", description = "Kullanıcının randevularını listele")
    public ResponseEntity<Page<AppointmentDto.AppointmentResponse>> getMyAppointments(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        var user = userDetailsService.getUserByEmail(userDetails.getUsername());
        
        if (user.getRole() == Role.BARBER) {
            return ResponseEntity.ok(appointmentService.getBarberAppointments(user.getId(), pageable));
        } else {
            return ResponseEntity.ok(appointmentService.getCustomerAppointments(user.getId(), pageable));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Durum güncelle", description = "Randevu durumunu güncelle")
    public ResponseEntity<AppointmentDto.AppointmentResponse> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDto.UpdateStatusRequest request) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(appointmentService.updateStatus(userId, id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Randevu iptal", description = "Randevuyu iptal et")
    public ResponseEntity<Void> cancelAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = userDetailsService.getUserByEmail(userDetails.getUsername()).getId();
        appointmentService.cancelAppointment(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/barbers/{barberProfileId}/slots")
    @Operation(summary = "Müsait saatler", description = "Belirli bir tarih için müsait randevu saatlerini getir")
    public ResponseEntity<AppointmentDto.AvailableSlotsResponse> getAvailableSlots(
            @PathVariable Long barberProfileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Integer serviceDuration) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(barberProfileId, date, serviceDuration));
    }
}
