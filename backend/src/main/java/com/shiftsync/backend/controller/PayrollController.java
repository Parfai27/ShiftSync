package com.shiftsync.backend.controller;

import com.shiftsync.backend.model.PayrollRecord;
import com.shiftsync.backend.service.PayrollService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping("/employee/{employeeId}")
    public List<PayrollRecord> getPayroll(@PathVariable Long employeeId) {
        return payrollService.getPayrollForEmployee(employeeId);
    }
}
