package com.barber.dto;

import com.barber.entity.BarberStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

public class BarberDto {
    
    @Data
    public static class CreateProfileRequest {
        @NotBlank(message = "Dükkan adı zorunludur")
        private String shopName;
        
        private String description;
        
        @NotBlank(message = "Adres zorunludur")
        private String address;
        
        @NotBlank(message = "Şehir zorunludur")
        private String city;
        
        @NotBlank(message = "İlçe zorunludur")
        private String district;
        
        private Double latitude;
        private Double longitude;
        private String profileImage;
    }
    
    @Data
    public static class UpdateProfileRequest {
        private String shopName;
        private String description;
        private String address;
        private String city;
        private String district;
        private Double latitude;
        private Double longitude;
        private String profileImage;
    }
    
    @Data
    public static class BarberListResponse {
        private Long id;
        private String shopName;
        private String city;
        private String district;
        private String profileImage;
        private Double averageRating;
        private Integer totalReviews;
        private String startingPrice;
    }
    
    @Data
    public static class BarberDetailResponse {
        private Long id;
        private Long userId;
        private String ownerName;
        private String shopName;
        private String description;
        private String address;
        private String city;
        private String district;
        private Double latitude;
        private Double longitude;
        private String profileImage;
        private Double averageRating;
        private Integer totalReviews;
        private BarberStatus status;
        private List<ServiceDto.ServiceResponse> services;
        private List<WorkingHoursDto.WorkingHoursResponse> workingHours;
    }
}
