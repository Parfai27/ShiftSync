package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.Shift;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByShiftDate(LocalDate shiftDate);
    List<Shift> findByBranchId(Long branchId);
}
