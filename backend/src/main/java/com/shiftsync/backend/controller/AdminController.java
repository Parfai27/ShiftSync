package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.AdminDtos.AdminAuditLogsResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminAutomationUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminCredentialResetResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminGeneralSettingsUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminIntegrationConfigUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminIntegrationsResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminSettingsWorkspaceResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminUserItem;
import com.shiftsync.backend.dto.AdminDtos.AdminUserManagementResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminUserRoleUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminUserStatusUpdateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminOverviewResponse;
import com.shiftsync.backend.dto.SettingsDtos.AdminSettingsResponse;
import com.shiftsync.backend.dto.SettingsDtos.ManagerSettingsResponse;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.CompliancePolicy;
import jakarta.validation.Valid;
import com.shiftsync.backend.service.AdminService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
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

    @GetMapping("/users")
    public AdminUserManagementResponse getUserManagement() {
        return adminService.getUserManagement();
    }

    @PatchMapping("/users/{userId}/status")
    public AdminUserItem updateUserStatus(
        @PathVariable Long userId,
        @Valid @RequestBody AdminUserStatusUpdateRequest request
    ) {
        return adminService.updateUserStatus(userId, request);
    }

    @PatchMapping("/users/{userId}/role")
    public AdminUserItem updateUserRole(
        @PathVariable Long userId,
        @Valid @RequestBody AdminUserRoleUpdateRequest request
    ) {
        return adminService.updateUserRole(userId, request);
    }

    @PostMapping("/users/{userId}/reset-credentials")
    public AdminCredentialResetResponse resetCredentials(
        @PathVariable Long userId,
        @RequestBody AdminUserStatusUpdateRequest request
    ) {
        return adminService.resetUserCredentials(userId, request.actorUserId());
    }

    @GetMapping("/audit-logs/workspace")
    public AdminAuditLogsResponse getAuditLogsWorkspace() {
        return adminService.getAuditLogsWorkspace();
    }

    @GetMapping("/integrations")
    public AdminIntegrationsResponse getIntegrations() {
        return adminService.getIntegrationsWorkspace();
    }

    @PatchMapping("/integrations/config")
    public AdminIntegrationsResponse updateIntegrationConfig(
        @Valid @RequestBody AdminIntegrationConfigUpdateRequest request
    ) {
        return adminService.updateIntegrationConfig(request);
    }

    @GetMapping("/manager-settings")
    public ManagerSettingsResponse getManagerSettings() {
        return adminService.getManagerSettings();
    }

    @GetMapping("/settings")
    public AdminSettingsResponse getAdminSettings() {
        return adminService.getAdminSettings();
    }

    @GetMapping("/settings/workspace")
    public AdminSettingsWorkspaceResponse getSettingsWorkspace() {
        return adminService.getSettingsWorkspace();
    }

    @PatchMapping("/settings/general")
    public AdminSettingsWorkspaceResponse updateSettingsWorkspace(
        @Valid @RequestBody AdminGeneralSettingsUpdateRequest request
    ) {
        return adminService.updateGeneralSettings(request);
    }

    @PatchMapping("/settings/automation")
    public AdminSettingsWorkspaceResponse updateAutomation(
        @Valid @RequestBody AdminAutomationUpdateRequest request
    ) {
        return adminService.updateAutomation(request);
    }
}
