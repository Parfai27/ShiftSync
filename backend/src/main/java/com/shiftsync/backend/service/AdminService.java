package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.AdminDtos.AdminAdministratorItem;
import com.shiftsync.backend.dto.AdminDtos.AdminAuditLogEntry;
import com.shiftsync.backend.dto.AdminDtos.AdminAuditLogsResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminAutomationItem;
import com.shiftsync.backend.dto.AdminDtos.AdminAutomationUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminCredentialResetResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminGeneralSettingsUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminIntegrationConfigUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminIntegrationMetric;
import com.shiftsync.backend.dto.AdminDtos.AdminIntegrationService;
import com.shiftsync.backend.dto.AdminDtos.AdminIntegrationsResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminNotificationPolicyItem;
import com.shiftsync.backend.dto.AdminDtos.AdminSettingsWorkspaceResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminUserItem;
import com.shiftsync.backend.dto.AdminDtos.AdminUserManagementResponse;
import com.shiftsync.backend.dto.AdminDtos.AdminUserRoleUpdateRequest;
import com.shiftsync.backend.dto.AdminDtos.AdminUserStatusUpdateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminAuditLogItem;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminOverviewResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminRegionNode;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminUserDistribution;
import com.shiftsync.backend.dto.SettingsDtos.AdminSettingsResponse;
import com.shiftsync.backend.dto.SettingsDtos.ManagerSettingsResponse;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.CompliancePolicy;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.SystemSetting;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.CompliancePolicyRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.SystemSettingRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CompliancePolicyRepository compliancePolicyRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final NotificationRepository notificationRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final Environment environment;
    private final CredentialEmailService credentialEmailService;
    private final PasswordEncoder passwordEncoder;

    public AdminOverviewResponse getAdminOverview() {
        List<AdminUserDistribution> distribution = List.of(
            new AdminUserDistribution("Administrators", userRepository.findByRole(Role.ADMIN).size()),
            new AdminUserDistribution("Managers", userRepository.findByRole(Role.MANAGER).size()),
            new AdminUserDistribution("Standard Users", userRepository.findByRole(Role.EMPLOYEE).size())
        );

        List<AdminRegionNode> regionalNodes = branchRepository.findAll().stream()
            .map(branch -> new AdminRegionNode(branch.getCode(), branch.isActive()))
            .toList();

        long totalUsers = userRepository.count();
        long activeSessions = notificationRepository.count();
        long activeBranches = branchRepository.count();
        List<Integer> healthBars = List.of(
            34,
            48,
            42,
            55,
            (int) Math.max(40, Math.min(82, totalUsers * 12)),
            (int) Math.max(38, Math.min(86, activeSessions * 18 + 24)),
            50,
            58,
            64,
            (int) Math.max(44, Math.min(88, activeBranches * 20 + 30)),
            60
        );

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        List<AdminAuditLogItem> auditItems = getRecentAuditLogs().stream()
            .map(log -> new AdminAuditLogItem(
                log.getActionTime().format(formatter),
                log.getAction(),
                log.getTargetModule(),
                log.getActor() != null ? log.getActor().getFullName() : "System",
                "Recorded"
            ))
            .toList();

        return new AdminOverviewResponse(
            branchRepository.count() > 0 ? "99.9%" : "0%",
            activeSessions,
            totalUsers,
            activeBranches,
            healthBars,
            distribution,
            regionalNodes,
            auditItems
        );
    }

    public List<CompliancePolicy> getPolicies() {
        return compliancePolicyRepository.findAll();
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop20ByOrderByActionTimeDesc();
    }

    public AdminUserManagementResponse getUserManagement() {
        List<User> users = userRepository.findAll().stream()
            .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
            .toList();

        List<AdminUserItem> userItems = users.stream()
            .map(user -> new AdminUserItem(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                formatRole(user.getRole()),
                user.isActive(),
                user.getBranch() != null ? user.getBranch().getName() : "System-wide"
            ))
            .toList();

        long activeUsers = users.stream().filter(User::isActive).count();
        long adminUsers = users.stream().filter(user -> user.getRole() == Role.ADMIN).count();

        return new AdminUserManagementResponse(
            users.size(),
            activeUsers,
            adminUsers,
            users.size() - activeUsers,
            userItems
        );
    }

    public AdminAuditLogsResponse getAuditLogsWorkspace() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        List<AuditLog> logs = auditLogRepository.findTop20ByOrderByActionTimeDesc();
        List<AdminAuditLogEntry> entries = logs.stream()
            .map(log -> new AdminAuditLogEntry(
                log.getId(),
                log.getActionTime().format(formatter),
                log.getActor() != null ? log.getActor().getFullName() : "System",
                log.getActor() != null ? formatRole(log.getActor().getRole()) : "Automation",
                log.getTargetModule(),
                log.getAction(),
                log.getDetails() != null && !log.getDetails().isBlank() ? log.getDetails() : "No additional notes recorded.",
                classifyAuditStatus(log)
            ))
            .toList();

        long securityEvents = logs.stream().filter(this::isSecurityEvent).count();
        long complianceEvents = logs.stream().filter(log -> containsAny(log.getTargetModule(), "compliance", "policy")).count();
        List<String> modules = logs.stream()
            .map(AuditLog::getTargetModule)
            .filter(module -> module != null && !module.isBlank())
            .distinct()
            .sorted(String.CASE_INSENSITIVE_ORDER)
            .toList();

        return new AdminAuditLogsResponse(logs.size(), securityEvents, complianceEvents, modules, entries);
    }

    public AdminIntegrationsResponse getIntegrationsWorkspace() {
        boolean publicApiEnabled = getAdminSettings().publicApiEnabled();
        boolean auditLoggingEnabled = getAdminSettings().auditLoggingEnabled();
        boolean mailConfigured = hasText(environment.getProperty("app.mail.username")) && hasText(environment.getProperty("app.mail.host"));
        boolean aiConfigured = hasText(environment.getProperty("app.ai.api-key"));
        SystemSetting systemSetting = getOrCreateSystemSetting();
        String aiBaseUrl = systemSetting.getAiBaseUrl();
        String aiModel = systemSetting.getAiModel();

        List<AdminIntegrationMetric> metrics = List.of(
            new AdminIntegrationMetric("Audit Records", String.valueOf(auditLogRepository.count()), "Immutable operational history"),
            new AdminIntegrationMetric("Unread Alerts", String.valueOf(notificationRepository.count()), "Current notification objects in the platform"),
            new AdminIntegrationMetric("Active Policies", String.valueOf(compliancePolicyRepository.findAll().stream().filter(CompliancePolicy::isActive).count()), "Compliance rules currently enabled"),
            new AdminIntegrationMetric("Pharmacy Sites", String.valueOf(branchRepository.count()), "Connected organization records")
        );

        List<AdminIntegrationService> services = List.of(
            new AdminIntegrationService("PostgreSQL Database", "Connected", "Core workforce data is stored in PostgreSQL.", true),
            new AdminIntegrationService("Credential Email Delivery", mailConfigured ? "Configured" : "Not configured", "Used for account onboarding, password resets, weekly shift emails, and shift reminders.", mailConfigured),
            new AdminIntegrationService("AI Assistant", aiConfigured ? "Configured" : "Fallback mode", aiConfigured ? aiModel + " via " + aiBaseUrl : "Sync will use the local fallback assistant until an API key is available.", aiConfigured),
            new AdminIntegrationService("Public API Access", publicApiEnabled ? "Enabled" : "Restricted", publicApiEnabled ? "The admin public API flag is enabled." : "Public API access is currently disabled in admin settings.", publicApiEnabled),
            new AdminIntegrationService("Audit Logging", auditLoggingEnabled ? "Enabled" : "Disabled", "Administrative changes and operational events are recorded in the audit log.", auditLoggingEnabled)
        );

        String provider = aiBaseUrl.contains("groq") ? "Groq" : aiBaseUrl.contains("openai") ? "OpenAI-compatible" : "Custom provider";
        return new AdminIntegrationsResponse(metrics, services, provider, aiBaseUrl, aiModel, publicApiEnabled, auditLoggingEnabled);
    }

    public AdminSettingsWorkspaceResponse getSettingsWorkspace() {
        AdminSettingsResponse adminSettings = getAdminSettings();
        ManagerSettingsResponse managerSettings = getManagerSettings();

        List<AdminAutomationItem> automations = List.of(
            new AdminAutomationItem("Audit logging", "Track administrative changes and operational events for review.", adminSettings.auditLoggingEnabled()),
            new AdminAutomationItem("Public API access", "Expose admin-approved integration access to external clients.", adminSettings.publicApiEnabled()),
            new AdminAutomationItem("Shift swap approvals", "Require manager review for employee swap requests.", managerSettings.allowShiftSwaps()),
            new AdminAutomationItem("Maximum hours enforcement", "Block scheduling that exceeds the allowed workload rules.", managerSettings.enforceMaxHours()),
            new AdminAutomationItem("Urgent manager alerts", "Notify managers when schedule changes require immediate action.", managerSettings.notifyManagersOnUrgentChanges())
        );

        List<AdminAdministratorItem> administrators = userRepository.findByRole(Role.ADMIN).stream()
            .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
            .map(user -> new AdminAdministratorItem(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                formatRole(user.getRole()),
                user.getBranch() != null ? user.getBranch().getName() : "System-wide",
                user.isActive()
            ))
            .toList();

        List<AdminNotificationPolicyItem> notificationPolicies = List.of(
            new AdminNotificationPolicyItem("Policy violations", "Flag compliance breaches or inactive coverage immediately.", true),
            new AdminNotificationPolicyItem("Weekly workforce mailouts", "Notify employees when weekly shifts are assigned.", hasText(environment.getProperty("app.mail.username"))),
            new AdminNotificationPolicyItem("Upcoming shift reminders", "Send reminder emails before an assigned shift starts.", hasText(environment.getProperty("app.mail.username"))),
            new AdminNotificationPolicyItem("AI assistant availability", "Surface whether the Sync assistant is using the live provider or local fallback.", hasText(environment.getProperty("app.ai.api-key")))
        );

        return new AdminSettingsWorkspaceResponse(
            adminSettings.defaultTimezone(),
            adminSettings.auditLoggingEnabled(),
            adminSettings.publicApiEnabled(),
            automations,
            administrators,
            notificationPolicies
        );
    }

    public ManagerSettingsResponse getManagerSettings() {
        SystemSetting settings = getOrCreateSystemSetting();
        return new ManagerSettingsResponse(
            settings.isAllowShiftSwaps(),
            settings.isEnforceMaxHours(),
            settings.isNotifyManagersOnUrgentChanges()
        );
    }

    public AdminSettingsResponse getAdminSettings() {
        SystemSetting settings = getOrCreateSystemSetting();
        return new AdminSettingsResponse(
            settings.getDefaultTimezone(),
            settings.isAuditLoggingEnabled(),
            settings.isPublicApiEnabled()
        );
    }

    public AdminUserItem updateUserStatus(Long targetUserId, AdminUserStatusUpdateRequest request) {
        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        User actor = resolveActor(request.actorUserId());

        if (targetUser.isActive() == request.active()) {
            return toAdminUserItem(targetUser);
        }

        if (!request.active() && targetUser.getRole() == Role.ADMIN) {
            long otherActiveAdmins = userRepository.findByRole(Role.ADMIN).stream()
                .filter(User::isActive)
                .filter(user -> !user.getId().equals(targetUserId))
                .count();
            if (otherActiveAdmins == 0) {
                throw new IllegalArgumentException("At least one active admin account must remain.");
            }
            if (actor != null && actor.getId().equals(targetUserId)) {
                throw new IllegalArgumentException("You cannot deactivate your own admin account.");
            }
        }

        targetUser.setActive(request.active());
        userRepository.save(targetUser);
        recordAdminAction(
            actor,
            request.active() ? "Activated user account" : "Deactivated user account",
            "Admin Users",
            targetUser.getFullName() + " (" + targetUser.getEmail() + ")"
        );
        return toAdminUserItem(targetUser);
    }

    public AdminSettingsWorkspaceResponse updateGeneralSettings(AdminGeneralSettingsUpdateRequest request) {
        SystemSetting settings = getOrCreateSystemSetting();
        User actor = resolveActor(request.actorUserId());

        settings.setDefaultTimezone(request.timezone() == null || request.timezone().isBlank() ? "Africa/Kigali" : request.timezone().trim());
        settings.setAuditLoggingEnabled(request.auditLoggingEnabled());
        settings.setPublicApiEnabled(request.publicApiEnabled());
        systemSettingRepository.save(settings);

        recordAdminAction(
            actor,
            "Updated admin settings",
            "Admin Settings",
            "Timezone=" + settings.getDefaultTimezone()
                + ", auditLogging=" + settings.isAuditLoggingEnabled()
                + ", publicApi=" + settings.isPublicApiEnabled()
        );
        return getSettingsWorkspace();
    }

    public AdminSettingsWorkspaceResponse updateAutomation(AdminAutomationUpdateRequest request) {
        if (request.key() == null || request.key().isBlank()) {
            throw new IllegalArgumentException("Automation key is required.");
        }

        SystemSetting settings = getOrCreateSystemSetting();
        User actor = resolveActor(request.actorUserId());
        String actionLabel;

        switch (request.key()) {
            case "audit-logging" -> {
                settings.setAuditLoggingEnabled(request.enabled());
                actionLabel = "Audit logging";
            }
            case "public-api" -> {
                settings.setPublicApiEnabled(request.enabled());
                actionLabel = "Public API access";
            }
            case "allow-shift-swaps" -> {
                settings.setAllowShiftSwaps(request.enabled());
                actionLabel = "Shift swap approvals";
            }
            case "enforce-max-hours" -> {
                settings.setEnforceMaxHours(request.enabled());
                actionLabel = "Maximum hours enforcement";
            }
            case "urgent-manager-alerts" -> {
                settings.setNotifyManagersOnUrgentChanges(request.enabled());
                actionLabel = "Urgent manager alerts";
            }
            default -> throw new IllegalArgumentException("Unknown automation setting.");
        }

        systemSettingRepository.save(settings);
        recordAdminAction(
            actor,
            "Updated automation setting",
            "Admin Settings",
            actionLabel + " set to " + (request.enabled() ? "enabled" : "disabled")
        );
        return getSettingsWorkspace();
    }

    public AdminUserItem updateUserRole(Long targetUserId, AdminUserRoleUpdateRequest request) {
        if (request.role() == null) {
            throw new IllegalArgumentException("A user role is required.");
        }

        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        User actor = resolveActor(request.actorUserId());
        Role previousRole = targetUser.getRole();

        if (previousRole == request.role()) {
            return toAdminUserItem(targetUser);
        }

        if (previousRole == Role.ADMIN && request.role() != Role.ADMIN) {
            long otherActiveAdmins = userRepository.findByRole(Role.ADMIN).stream()
                .filter(User::isActive)
                .filter(user -> !user.getId().equals(targetUserId))
                .count();
            if (otherActiveAdmins == 0) {
                throw new IllegalArgumentException("At least one active admin account must remain.");
            }
        }

        targetUser.setRole(request.role());
        userRepository.save(targetUser);
        recordAdminAction(
            actor,
            "Updated user role",
            "Admin Users",
            targetUser.getFullName() + " changed from " + formatRole(previousRole) + " to " + formatRole(request.role())
        );
        return toAdminUserItem(targetUser);
    }

    public AdminCredentialResetResponse resetUserCredentials(Long targetUserId, Long actorUserId) {
        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        User actor = resolveActor(actorUserId);

        String temporaryPassword = generateTemporaryPassword(targetUser);
        targetUser.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        targetUser.setMustChangePassword(true);
        userRepository.save(targetUser);

        boolean emailSent = credentialEmailService.sendAdminResetCredentials(
            targetUser.getEmail(),
            targetUser.getFullName(),
            temporaryPassword
        );

        recordAdminAction(
            actor,
            "Reset user credentials",
            "Admin Users",
            "Credentials reset for " + targetUser.getFullName() + " (" + targetUser.getEmail() + "), emailSent=" + emailSent
        );

        return new AdminCredentialResetResponse(
            targetUser.getId(),
            targetUser.getFullName(),
            targetUser.getEmail(),
            emailSent,
            temporaryPassword,
            emailSent
                ? "A temporary password was generated and emailed to the user."
                : "A temporary password was generated, but email delivery failed. Share it manually."
        );
    }

    public AdminIntegrationsResponse updateIntegrationConfig(AdminIntegrationConfigUpdateRequest request) {
        SystemSetting settings = getOrCreateSystemSetting();
        User actor = resolveActor(request.actorUserId());

        settings.setAiBaseUrl(request.aiBaseUrl() == null || request.aiBaseUrl().isBlank() ? "https://api.openai.com/v1" : request.aiBaseUrl().trim());
        settings.setAiModel(request.aiModel() == null || request.aiModel().isBlank() ? "gpt-4o-mini" : request.aiModel().trim());
        systemSettingRepository.save(settings);

        recordAdminAction(
            actor,
            "Updated AI integration config",
            "Admin Integrations",
            "AI base URL set to " + settings.getAiBaseUrl() + " and model set to " + settings.getAiModel()
        );

        return getIntegrationsWorkspace();
    }

    private String formatRole(Role role) {
        String lower = role.name().toLowerCase(Locale.ENGLISH);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private String classifyAuditStatus(AuditLog log) {
        if (isSecurityEvent(log)) {
            return "Security";
        }
        if (containsAny(log.getTargetModule(), "compliance", "policy")) {
            return "Compliance";
        }
        if (log.getActionTime().isBefore(LocalDateTime.now().minusDays(1))) {
            return "Recorded";
        }
        return "Recent";
    }

    private boolean isSecurityEvent(AuditLog log) {
        return containsAny(log.getAction(), "login", "password", "security", "blocked", "failed")
            || containsAny(log.getDetails(), "login", "password", "security", "blocked", "failed");
    }

    private boolean containsAny(String value, String... terms) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = value.toLowerCase(Locale.ENGLISH);
        for (String term : terms) {
            if (normalized.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private AdminUserItem toAdminUserItem(User user) {
        return new AdminUserItem(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            formatRole(user.getRole()),
            user.isActive(),
            user.getBranch() != null ? user.getBranch().getName() : "System-wide"
        );
    }

    private SystemSetting getOrCreateSystemSetting() {
        return systemSettingRepository.findBySettingKey("PRIMARY")
            .orElseGet(() -> systemSettingRepository.save(
                SystemSetting.builder()
                    .settingKey("PRIMARY")
                    .defaultTimezone("Africa/Kigali")
                    .auditLoggingEnabled(true)
                    .publicApiEnabled(false)
                    .allowShiftSwaps(true)
                    .enforceMaxHours(true)
                    .notifyManagersOnUrgentChanges(true)
                    .aiBaseUrl(environment.getProperty("app.ai.base-url", "https://api.openai.com/v1"))
                    .aiModel(environment.getProperty("app.ai.model", "gpt-4o-mini"))
                    .build()
            ));
    }

    private User resolveActor(Long actorUserId) {
        if (actorUserId == null) {
            return null;
        }
        return userRepository.findById(actorUserId).orElse(null);
    }

    private void recordAdminAction(User actor, String action, String module, String details) {
        auditLogRepository.save(
            AuditLog.builder()
                .actor(actor)
                .action(action)
                .targetModule(module)
                .actionTime(LocalDateTime.now())
                .details(details)
                .build()
        );
    }

    private String generateTemporaryPassword(User user) {
        String seed = user.getFullName() == null ? "ShiftSync" : user.getFullName().replaceAll("[^A-Za-z]", "");
        String prefix = seed.isBlank() ? "ShiftSync" : seed.substring(0, Math.min(4, seed.length()));
        String suffix = String.valueOf(System.currentTimeMillis());
        return prefix + "@" + suffix.substring(Math.max(0, suffix.length() - 6));
    }
}
