package com.shiftsync.backend.dto;

import com.shiftsync.backend.model.Role;
import java.util.List;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record AdminUserItem(
        Long id,
        String fullName,
        String email,
        String role,
        boolean active,
        String branchLabel
    ) {
    }

    public record AdminUserManagementResponse(
        long totalUsers,
        long activeUsers,
        long adminUsers,
        long inactiveUsers,
        List<AdminUserItem> users
    ) {
    }

    public record AdminUserStatusUpdateRequest(
        Long actorUserId,
        boolean active
    ) {
    }

    public record AdminUserRoleUpdateRequest(
        Long actorUserId,
        Role role
    ) {
    }

    public record AdminCredentialResetResponse(
        Long userId,
        String fullName,
        String email,
        boolean emailSent,
        String temporaryPassword,
        String message
    ) {
    }

    public record AdminAuditLogEntry(
        Long id,
        String timestamp,
        String actorName,
        String actorRole,
        String module,
        String action,
        String details,
        String status
    ) {
    }

    public record AdminAuditLogsResponse(
        long totalLogs,
        long securityEvents,
        long complianceEvents,
        List<String> modules,
        List<AdminAuditLogEntry> logs
    ) {
    }

    public record AdminIntegrationMetric(
        String label,
        String value,
        String detail
    ) {
    }

    public record AdminIntegrationService(
        String name,
        String status,
        String detail,
        boolean healthy
    ) {
    }

    public record AdminIntegrationsResponse(
        List<AdminIntegrationMetric> metrics,
        List<AdminIntegrationService> services,
        String aiProvider,
        String aiBaseUrl,
        String aiModel,
        boolean publicApiEnabled,
        boolean auditLoggingEnabled
    ) {
    }

    public record AdminIntegrationConfigUpdateRequest(
        Long actorUserId,
        String aiBaseUrl,
        String aiModel
    ) {
    }

    public record AdminAutomationItem(
        String title,
        String description,
        boolean enabled
    ) {
    }

    public record AdminAdministratorItem(
        Long userId,
        String fullName,
        String email,
        String roleLabel,
        String branchLabel,
        boolean active
    ) {
    }

    public record AdminNotificationPolicyItem(
        String title,
        String detail,
        boolean enabled
    ) {
    }

    public record AdminSettingsWorkspaceResponse(
        String timezone,
        boolean auditLoggingEnabled,
        boolean publicApiEnabled,
        List<AdminAutomationItem> automations,
        List<AdminAdministratorItem> administrators,
        List<AdminNotificationPolicyItem> notificationPolicies
    ) {
    }

    public record AdminGeneralSettingsUpdateRequest(
        Long actorUserId,
        String timezone,
        boolean auditLoggingEnabled,
        boolean publicApiEnabled
    ) {
    }

    public record AdminAutomationUpdateRequest(
        Long actorUserId,
        String key,
        boolean enabled
    ) {
    }
}
