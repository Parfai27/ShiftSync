package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.OverviewPageDtos.AdminAuditLogItem;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminOverviewResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminRegionNode;
import com.shiftsync.backend.dto.OverviewPageDtos.AdminUserDistribution;
import com.shiftsync.backend.dto.SettingsDtos.AdminSettingsResponse;
import com.shiftsync.backend.dto.SettingsDtos.ManagerSettingsResponse;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.CompliancePolicy;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.CompliancePolicyRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CompliancePolicyRepository compliancePolicyRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final NotificationRepository notificationRepository;

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

    public ManagerSettingsResponse getManagerSettings() {
        return new ManagerSettingsResponse(true, true, true);
    }

    public AdminSettingsResponse getAdminSettings() {
        return new AdminSettingsResponse("Africa/Kigali", true, false);
    }
}
