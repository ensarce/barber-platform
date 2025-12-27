package com.barber.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public class WorkingHoursDto {
    
    @Data
    public static class WorkingHoursRequest {
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean isClosed;
    }
    
    @Data
    public static class BulkWorkingHoursRequest {
        private List<WorkingHoursRequest> workingHours;
    }
    
    @Data
    public static class WorkingHoursResponse {
        private Long id;
        private DayOfWeek dayOfWeek;
        private String dayName; // Türkçe gün adı
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean isClosed;
    }
}
