package com.shiftsync.backend.dto;

import java.util.List;

public final class ManagerWorkspaceDtos {

    private ManagerWorkspaceDtos() {
    }

    public record ManagerIdentity(
        Long userId,
        String fullName,
        String roleLabel,
        String branchName,
        String profileImageUrl
    ) {
    }

    public record RosterItem(
        Long userId,
        String name,
        String role,
        String department,
        String status,
        String shift,
        String avatar,
        String tone
    ) {
    }

    public record EmployeeDetail(
        Long userId,
        String name,
        String role,
        String employeeCode,
        String avatar,
        String email,
        String phoneNumber,
        String hiredDate,
        String location,
        String workload,
        List<String> expertise,
        List<Boolean> weeklyAvailability
    ) {
    }

    public record ProfilesSection(
        String summary,
        String paginationLabel,
        List<RosterItem> roster,
        EmployeeDetail featuredEmployee
    ) {
    }

    public record SchedulingStat(
        String label,
        String value,
        String note
    ) {
    }

    public record SchedulingDay(
        String day,
        String date,
        String alert
    ) {
    }

    public record ScheduleBlock(
        String label,
        String tone
    ) {
    }

    public record ScheduleRow(
        String name,
        String role,
        String hours,
        String avatar,
        boolean open,
        List<List<ScheduleBlock>> blocks
    ) {
    }

    public record ScheduledRoleSlot(
        String role,
        String employeeName,
        String employeeAvatar,
        String status
    ) {
    }

    public record ShiftLane(
        String shiftName,
        String window,
        String tone,
        long assignedStaff,
        int requiredStaff,
        String status,
        List<ScheduledRoleSlot> roles
    ) {
    }

    public record SchedulingBoardDay(
        String day,
        String date,
        String fullDate,
        boolean hasGap,
        List<ShiftLane> shifts
    ) {
    }

    public record WeeklyScheduleBoard(
        String label,
        List<SchedulingBoardDay> days
    ) {
    }

    public record LegendItem(
        String label,
        String tone
    ) {
    }

    public record SchedulingOverviewCard(
        String title,
        String subtitle,
        String peakCoverage,
        String teamsActive,
        String alerts
    ) {
    }

    public record SchedulingSuggestion(
        String eyebrow,
        String title,
        String description,
        String actionLabel
    ) {
    }

    public record SchedulingSection(
        String summary,
        List<SchedulingStat> stats,
        List<SchedulingDay> days,
        List<ScheduleRow> rows,
        WeeklyScheduleBoard weeklyBoard,
        List<LegendItem> legend,
        SchedulingOverviewCard overview,
        SchedulingSuggestion suggestion
    ) {
    }

    public record AdjustmentRequestCard(
        Long id,
        String name,
        String requested,
        String from,
        String fromShift,
        String to,
        String toShift,
        String reason,
        String status
    ) {
    }

    public record AdjustmentMetric(
        String label,
        String value
    ) {
    }

    public record ActivityItem(
        String label,
        String detail,
        String tone,
        String time,
        String action,
        String tag
    ) {
    }

    public record ComplianceCheck(
        String title,
        String detail,
        String tone
    ) {
    }

    public record AdjustmentsSection(
        String summary,
        List<AdjustmentRequestCard> requests,
        List<ComplianceCheck> checks,
        List<AdjustmentMetric> metrics,
        List<ActivityItem> recentActivity
    ) {
    }

    public record FolderItem(
        String label,
        String count,
        boolean active,
        String tone
    ) {
    }

    public record NotificationItem(
        Long id,
        String kind,
        String time,
        String title,
        String description,
        String action,
        String secondaryAction,
        String original,
        String proposed,
        String link,
        boolean read
    ) {
    }

    public record NotificationSummary(
        long unread,
        long urgent
    ) {
    }

    public record NotificationsSection(
        String summary,
        String todayLabel,
        String earlierLabel,
        List<FolderItem> folders,
        List<FolderItem> priorityFolders,
        List<NotificationItem> todayItems,
        List<NotificationItem> earlierItems,
        NotificationSummary summaryCards,
        String liveFeedTitle,
        String liveFeedDescription
    ) {
    }

    public record PolicyCard(
        Long id,
        String title,
        String description,
        String category,
        String tone,
        String badge,
        boolean active,
        String progressLabel,
        String progressValue,
        String progressTone,
        String progressWidth,
        List<String> checklist
    ) {
    }

    public record ComplianceAlert(
        String title,
        String description,
        String severity
    ) {
    }

    public record ComplianceSection(
        String summary,
        ComplianceAlert alert,
        String activePolicies,
        String complianceRate,
        List<PolicyCard> policies,
        List<ActivityItem> activity
    ) {
    }

    public record ReportMetric(
        String title,
        String value,
        String delta,
        String accent
    ) {
    }

    public record DistributionItem(
        String label,
        int value,
        String tone
    ) {
    }

    public record ReportRow(
        String initials,
        String name,
        String id,
        String date,
        String department,
        String punchIn,
        String status,
        boolean danger
    ) {
    }

    public record ReportsSection(
        String summary,
        List<ReportMetric> metrics,
        List<Integer> attendanceBars,
        List<String> weekLabels,
        int capacityPercent,
        List<DistributionItem> distribution,
        List<ReportRow> recentCompliance
    ) {
    }

    public record VisibilityRule(
        String label,
        String detail,
        boolean enabled
    ) {
    }

    public record WorkflowRule(
        String title,
        String badge,
        String detail,
        String actionLabel
    ) {
    }

    public record SettingsSection(
        String summary,
        List<VisibilityRule> visibilityRules,
        List<WorkflowRule> workflowRules,
        String departmentName,
        String workWeekStartDay,
        String overtimeThreshold,
        String currencyLocalization,
        String branchBanner
    ) {
    }

    public record ManagerWorkspaceResponse(
        ManagerIdentity manager,
        ProfilesSection profiles,
        SchedulingSection scheduling,
        AdjustmentsSection adjustments,
        NotificationsSection notifications,
        ComplianceSection compliance,
        ReportsSection reports,
        SettingsSection settings
    ) {
    }
}
