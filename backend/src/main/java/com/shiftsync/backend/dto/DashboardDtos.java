package com.shiftsync.backend.dto;

import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {
    }

    public record MetricCard(String title, String value, String delta, String note) {
    }

    public record ShiftStatusCard(String name, String time, String fill, String status, String dayLabel) {
    }

    public record AdjustmentSummary(String employee, String type, String originalValue, String revisedValue, String status, String requestedAt) {
    }

    public record OverviewResponse(
        List<MetricCard> metrics,
        List<ShiftStatusCard> shiftStatuses,
        List<AdjustmentSummary> recentAdjustments,
        List<Integer> attendanceBars,
        List<String> weekLabels,
        List<String> heatmap,
        String alertTitle,
        String alertDescription,
        long unreadNotifications
    ) {
    }
}
