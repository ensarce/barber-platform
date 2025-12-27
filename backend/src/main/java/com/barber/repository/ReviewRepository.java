package com.barber.repository;

import com.barber.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Page<Review> findByBarberProfileIdAndIsVisibleTrueOrderByCreatedAtDesc(Long barberProfileId, Pageable pageable);
    
    Page<Review> findByBarberProfileIdOrderByCreatedAtDesc(Long barberProfileId, Pageable pageable);
    
    Optional<Review> findByAppointmentId(Long appointmentId);
    
    boolean existsByAppointmentId(Long appointmentId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.barberProfile.id = :barberProfileId AND r.isVisible = true")
    Double calculateAverageRating(@Param("barberProfileId") Long barberProfileId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.barberProfile.id = :barberProfileId AND r.isVisible = true")
    Integer countVisibleReviews(@Param("barberProfileId") Long barberProfileId);
}
