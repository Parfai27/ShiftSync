package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.Availability;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByEmployeeId(Long employeeId);
    List<Availability> findByAvailableDate(LocalDate availableDate);
    void deleteByEmployeeId(Long employeeId);
}
