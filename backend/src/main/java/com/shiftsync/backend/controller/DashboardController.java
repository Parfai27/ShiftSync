package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.DashboardDtos.OverviewResponse;
import com.shiftsync.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview/{managerId}")
    public OverviewResponse getOverview(
        @PathVariable Long managerId,
        @RequestParam(defaultValue = "7") int rangeDays
    ) {
        return dashboardService.getOverview(managerId, rangeDays);
    }
}
