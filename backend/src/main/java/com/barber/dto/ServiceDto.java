package com.barber.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

public class ServiceDto {
    
    @Data
    public static class CreateServiceRequest {
        @NotBlank(message = "Hizmet adı zorunludur")
        private String name;
        
        private String description;
        
        @NotNull(message = "Süre zorunludur")
        @Positive(message = "Süre pozitif olmalıdır")
        private Integer durationMinutes;
        
        @NotNull(message = "Fiyat zorunludur")
        @Positive(message = "Fiyat pozitif olmalıdır")
        private BigDecimal price;
    }
    
    @Data
    public static class UpdateServiceRequest {
        private String name;
        private String description;
        private Integer durationMinutes;
        private BigDecimal price;
        private Boolean isActive;
    }
    
    @Data
    public static class ServiceResponse {
        private Long id;
        private String name;
        private String description;
        private Integer durationMinutes;
        private BigDecimal price;
        private Boolean isActive;
    }
}
