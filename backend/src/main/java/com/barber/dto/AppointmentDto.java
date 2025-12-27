package com.barber.dto;

import com.barber.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentDto {
    
    @Data
    public static class CreateAppointmentRequest {
        @NotNull(message = "Kuaför seçimi zorunludur")
        private Long barberProfileId;
        
        @NotNull(message = "Hizmet seçimi zorunludur")
        private Long serviceId;
        
        @NotNull(message = "Tarih seçimi zorunludur")
        private LocalDate appointmentDate;
        
        @NotNull(message = "Saat seçimi zorunludur")
        private LocalTime startTime;
        
        private String notes;
    }
    
    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "Durum zorunludur")
        private AppointmentStatus status;
    }
    
    @Data
    public static class AppointmentResponse {
        private Long id;
        private Long customerId;
        private String customerName;
        private Long barberProfileId;
        private String barberShopName;
        private Long serviceId;
        private String serviceName;
        private LocalDate appointmentDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private AppointmentStatus status;
        private BigDecimal totalPrice;
        private String notes;
        private LocalDateTime createdAt;
        private Boolean canReview; // Tamamlanan ve henüz değerlendirilmemiş mi?
    }
    
    @Data
    public static class TimeSlot {
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean available;
        
        public TimeSlot(LocalTime startTime, LocalTime endTime, Boolean available) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.available = available;
        }
    }
    
    @Data
    public static class AvailableSlotsResponse {
        private LocalDate date;
        private java.util.List<TimeSlot> slots;
    }
}
