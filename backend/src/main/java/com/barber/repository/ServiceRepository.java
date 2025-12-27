package com.barber.repository;

import com.barber.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByBarberProfileIdAndIsActiveTrue(Long barberProfileId);
    List<Service> findByBarberProfileId(Long barberProfileId);
}
