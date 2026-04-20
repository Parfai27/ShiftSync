package com.shiftsync.backend.service;

import com.shiftsync.backend.model.PayrollRecord;
import com.shiftsync.backend.repository.PayrollRecordRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRecordRepository payrollRecordRepository;

    public List<PayrollRecord> getPayrollForEmployee(Long employeeId) {
        return payrollRecordRepository.findByEmployeeId(employeeId);
    }
}
