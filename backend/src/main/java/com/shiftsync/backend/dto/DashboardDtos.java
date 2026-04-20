package com.shiftsync.backend.dto;

import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {
    }

    public record MetricCard(String title, String value, String delta) {
    }

    public record ShiftStatusCard(String name, String time, String fill, String status) {
    }

    public record AdjustmentSummary(String employee, String type, String originalValue, String revisedValue, String status) {
    }

    public record OverviewResponse(
        List<MetricCard> metrics,
        List<ShiftStatusCard> shiftStatuses,
        List<AdjustmentSummary> recentAdjustments
    ) {
    }
}
