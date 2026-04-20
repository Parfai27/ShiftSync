package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeOverviewResponse;
import com.shiftsync.backend.service.EmployeeOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeOverviewService employeeOverviewService;

    @GetMapping("/overview/{userId}")
    public EmployeeOverviewResponse getOverview(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeOverview(userId);
    }
}
