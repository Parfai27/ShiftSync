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

    public record EmployeeWeekDay(String day, String date, boolean active) {
    }

    public record EmployeeScheduleMetric(String title, String value, String suffix, String note) {
    }

    public record EmployeeAssignedShift(
        Long shiftId,
        String shiftName,
        String shiftDate,
        String shiftWindow
    ) {
    }

    public record EmployeeSwapRequestOption(
        Long employeeId,
        String employeeName
    ) {
    }

    public record EmployeeShiftAdjustmentItem(
        Long requestId,
        Long shiftId,
        String shiftLabel,
        String adjustmentType,
        String reason,
        String status,
        String targetEmployeeName,
        String targetEmployeeResponse
    ) {
    }

    public record EmployeeCalendarEvent(String time, String title, String subtitle, String tone, String note) {
    }

    public record EmployeeCalendarCell(
        int day,
        boolean muted,
        boolean selected,
        boolean dot,
        boolean openShift,
        EmployeeCalendarEvent event
    ) {
    }

    public record EmployeeNotificationItem(String title, String detail, String when, boolean active) {
    }

    public record EmployeeInboxItem(
        Long id,
        String title,
        String detail,
        String when,
        String kind,
        boolean unread
    ) {
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

    public record EmployeeSchedulePageResponse(
        String employeeName,
        String roleLabel,
        String monthLabel,
        String scheduleSummary,
        List<EmployeeWeekDay> weekDays,
        List<EmployeeCalendarCell> calendarCells,
        List<EmployeeScheduleMetric> metrics,
        List<EmployeeNotificationItem> notifications,
        List<EmployeeResourceItem> resources,
        int openShiftCount,
        List<EmployeeAssignedShift> assignedShifts,
        List<EmployeeSwapRequestOption> swapCandidates,
        List<EmployeeShiftAdjustmentItem> outgoingAdjustments,
        List<EmployeeShiftAdjustmentItem> incomingSwapRequests
    ) {
    }

    public record EmployeeAdjustmentCreateRequest(
        Long shiftId,
        String adjustmentType,
        Long targetEmployeeId,
        String reason
    ) {
    }

    public record EmployeeSwapResponseRequest(
        boolean accepted,
        String note
    ) {
    }

    public record EmployeeNotificationsPageResponse(
        String employeeName,
        String roleLabel,
        long totalCount,
        long unreadCount,
        long scheduleCount,
        long systemCount,
        List<EmployeeInboxItem> notifications
    ) {
    }

    public record EmployeeProfilePageResponse(
        String employeeName,
        String roleLabel,
        String fullName,
        String email,
        String profileImageUrl,
        String employeeCode,
        String jobTitle,
        String phoneNumber,
        String hireDate,
        String hourlyRate,
        String emergencyContactName,
        String emergencyContactPhone,
        boolean active,
        String pharmacyLabel
    ) {
    }

    public record EmployeeProfileUpdateRequest(
        String fullName,
        String phoneNumber,
        String emergencyContactName,
        String emergencyContactPhone,
        String profileImageUrl
    ) {
    }

    public record EmployeeAvailabilitySlot(
        String day,
        String time,
        boolean active
    ) {
    }

    public record EmployeeNotificationRule(
        String title,
        String detail,
        boolean email,
        boolean push
    ) {
    }

    public record EmployeeSettingsResponse(
        String employeeName,
        String roleLabel,
        String displayName,
        String contactEmail,
        String profileImageUrl,
        List<EmployeeAvailabilitySlot> availability,
        List<EmployeeNotificationRule> notificationRules,
        boolean hideProfile,
        boolean quietHoursEnabled
    ) {
    }

    public record EmployeeNotificationRuleUpdate(
        String title,
        boolean email,
        boolean push
    ) {
    }

    public record EmployeeAvailabilitySlotUpdate(
        String day,
        String time,
        boolean active
    ) {
    }

    public record EmployeeSettingsUpdateRequest(
        String displayName,
        String profileImageUrl,
        List<EmployeeAvailabilitySlotUpdate> availability,
        List<EmployeeNotificationRuleUpdate> notificationRules,
        boolean hideProfile,
        boolean quietHoursEnabled
    ) {
    }

    public record EmployeeAnnouncementHighlight(
        String label,
        String value
    ) {
    }

    public record EmployeeAnnouncementItem(
        Long id,
        String title,
        String message,
        String publishedAt,
        String publishedBy,
        boolean featured
    ) {
    }

    public record EmployeeAnnouncementsPageResponse(
        String employeeName,
        String roleLabel,
        String pharmacyLabel,
        long totalAnnouncements,
        long weeklyAnnouncements,
        String latestAnnouncementDate,
        EmployeeAnnouncementItem featuredAnnouncement,
        List<EmployeeAnnouncementHighlight> highlights,
        List<EmployeeAnnouncementItem> announcements,
        List<EmployeeResourceItem> resources
    ) {
    }

    public record EmployeePaySummaryCard(
        String label,
        String value,
        String note,
        boolean highlighted
    ) {
    }

    public record EmployeePayTrendPoint(
        String label,
        String value,
        int height
    ) {
    }

    public record EmployeePayBreakdownItem(
        String label,
        String hours,
        String rate,
        String amount,
        int percentage,
        String tone
    ) {
    }

    public record EmployeePayslipItem(
        Long id,
        String period,
        String depositNote,
        String netAmount,
        String grossAmount,
        String regularHours,
        String overtimeHours
    ) {
    }

    public record EmployeeEarningsPageResponse(
        String employeeName,
        String roleLabel,
        List<EmployeePaySummaryCard> summaryCards,
        List<EmployeePayTrendPoint> trend,
        List<EmployeePayBreakdownItem> breakdown,
        String taxEstimate,
        List<EmployeePayslipItem> payslips
    ) {
    }
}
