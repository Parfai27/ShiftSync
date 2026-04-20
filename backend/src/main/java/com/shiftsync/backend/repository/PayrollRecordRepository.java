package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.PayrollRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    List<PayrollRecord> findByEmployeeId(Long employeeId);
}
