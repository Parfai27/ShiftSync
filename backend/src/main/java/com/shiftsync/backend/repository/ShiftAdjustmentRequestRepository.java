package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftAdjustmentRequestRepository extends JpaRepository<ShiftAdjustmentRequest, Long> {
    List<ShiftAdjustmentRequest> findByStatus(AdjustmentStatus status);
    List<ShiftAdjustmentRequest> findByEmployeeId(Long employeeId);
    List<ShiftAdjustmentRequest> findByTargetEmployeeId(Long targetEmployeeId);
    void deleteByEmployeeIdOrTargetEmployeeId(Long employeeId, Long targetEmployeeId);
}
