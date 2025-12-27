package com.barber.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

public class ReviewDto {
    
    @Data
    public static class CreateReviewRequest {
        @NotNull(message = "Randevu seçimi zorunludur")
        private Long appointmentId;
        
        @NotNull(message = "Puan zorunludur")
        @Min(value = 1, message = "Puan en az 1 olmalıdır")
        @Max(value = 5, message = "Puan en fazla 5 olmalıdır")
        private Integer rating;
        
        private String comment;
    }
    
    @Data
    public static class ReviewResponse {
        private Long id;
        private Long customerId;
        private String customerName;
        private Long barberProfileId;
        private Long appointmentId;
        private Integer rating;
        private String comment;
        private Boolean isVisible;
        private LocalDateTime createdAt;
    }
    
    @Data
    public static class UpdateVisibilityRequest {
        @NotNull(message = "Görünürlük durumu zorunludur")
        private Boolean isVisible;
    }
}
