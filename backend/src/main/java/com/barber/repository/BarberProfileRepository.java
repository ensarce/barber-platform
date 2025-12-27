package com.barber.repository;

import com.barber.entity.BarberProfile;
import com.barber.entity.BarberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BarberProfileRepository extends JpaRepository<BarberProfile, Long> {
    
    Optional<BarberProfile> findByUserId(Long userId);
    
    Page<BarberProfile> findByStatus(BarberStatus status, Pageable pageable);
    
    @Query(value = "SELECT b FROM BarberProfile b WHERE b.status = com.barber.entity.BarberStatus.APPROVED " +
           "AND (:city IS NULL OR b.city = :city) " +
           "AND (:district IS NULL OR b.district = :district)")
    Page<BarberProfile> findApprovedBarbers(
        @Param("city") String city,
        @Param("district") String district,
        Pageable pageable
    );
    
    @Query("SELECT b FROM BarberProfile b WHERE b.status = com.barber.entity.BarberStatus.APPROVED " +
           "AND b.averageRating >= :minRating " +
           "ORDER BY b.averageRating DESC")
    List<BarberProfile> findTopRatedBarbers(@Param("minRating") Double minRating);
    
    List<BarberProfile> findByStatusOrderByCreatedAtDesc(BarberStatus status);
}
