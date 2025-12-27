package com.barber.repository;

import com.barber.entity.Appointment;
import com.barber.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    Page<Appointment> findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(Long customerId, Pageable pageable);
    
    Page<Appointment> findByBarberProfileIdOrderByAppointmentDateDescStartTimeDesc(Long barberProfileId, Pageable pageable);
    
    List<Appointment> findByBarberProfileIdAndAppointmentDateAndStatusIn(
        Long barberProfileId, 
        LocalDate date, 
        List<AppointmentStatus> statuses
    );
    
    @Query("SELECT a FROM Appointment a WHERE a.barberProfile.id = :barberProfileId " +
           "AND a.appointmentDate = :date " +
           "AND a.status IN ('PENDING', 'CONFIRMED') " +
           "AND ((a.startTime <= :startTime AND a.endTime > :startTime) " +
           "OR (a.startTime < :endTime AND a.endTime >= :endTime) " +
           "OR (a.startTime >= :startTime AND a.endTime <= :endTime))")
    List<Appointment> findConflictingAppointments(
        @Param("barberProfileId") Long barberProfileId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    
    List<Appointment> findByCustomerIdAndStatus(Long customerId, AppointmentStatus status);
    
    List<Appointment> findByBarberProfileIdAndStatus(Long barberProfileId, AppointmentStatus status);
}
