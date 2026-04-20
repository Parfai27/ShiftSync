package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.OverviewPageDtos.AdminOverviewResponse;
import com.shiftsync.backend.dto.SettingsDtos.AdminSettingsResponse;
import com.shiftsync.backend.dto.SettingsDtos.ManagerSettingsResponse;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.CompliancePolicy;
import com.shiftsync.backend.service.AdminService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/overview")
    public AdminOverviewResponse getOverview() {
        return adminService.getAdminOverview();
    }

    @GetMapping("/policies")
    public List<CompliancePolicy> getPolicies() {
        return adminService.getPolicies();
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return adminService.getRecentAuditLogs();
    }

    @GetMapping("/manager-settings")
    public ManagerSettingsResponse getManagerSettings() {
        return adminService.getManagerSettings();
    }

    @GetMapping("/settings")
    public AdminSettingsResponse getAdminSettings() {
        return adminService.getAdminSettings();
    }
}
