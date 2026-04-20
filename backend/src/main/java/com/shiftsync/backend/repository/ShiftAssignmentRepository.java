package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.ShiftAssignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    List<ShiftAssignment> findByEmployeeId(Long employeeId);
    List<ShiftAssignment> findByShiftId(Long shiftId);
}
