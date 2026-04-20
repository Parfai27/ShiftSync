package com.shiftsync.backend.dto;

import java.util.List;

public final class OverviewPageDtos {

    private OverviewPageDtos() {
    }

    public record AdminUserDistribution(String role, long count) {
    }

    public record AdminRegionNode(String label, boolean healthy) {
    }

    public record AdminAuditLogItem(String timestamp, String event, String origin, String actor, String status) {
    }

    public record AdminOverviewResponse(
        String systemHealth,
        long activeSessions,
        long totalUsers,
        long activeBranches,
        List<Integer> healthBars,
        List<AdminUserDistribution> userDistribution,
        List<AdminRegionNode> regionalNodes,
        List<AdminAuditLogItem> auditLogs
    ) {
    }

    public record EmployeeStat(String label, String value, String sub, String tag) {
    }

    public record EmployeeScheduleItem(String time, String slot, String title, String subtitle, String meta, String date) {
    }

    public record EmployeeNotificationItem(String title, String detail, String when, boolean active) {
    }

    public record EmployeeResourceItem(String name) {
    }

    public record EmployeeOverviewResponse(
        String employeeName,
        String roleLabel,
        List<EmployeeStat> stats,
        List<EmployeeScheduleItem> schedule,
        List<EmployeeNotificationItem> notifications,
        List<EmployeeResourceItem> resources
    ) {
    }
}
