package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.DashboardDtos.OverviewResponse;
import com.shiftsync.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public OverviewResponse getOverview() {
        return dashboardService.getOverview();
    }
}
