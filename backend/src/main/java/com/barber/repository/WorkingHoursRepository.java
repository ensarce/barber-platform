package com.barber.repository;

import com.barber.entity.WorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Long> {
    List<WorkingHours> findByBarberProfileIdOrderByDayOfWeek(Long barberProfileId);
    Optional<WorkingHours> findByBarberProfileIdAndDayOfWeek(Long barberProfileId, DayOfWeek dayOfWeek);
    void deleteByBarberProfileId(Long barberProfileId);
}
