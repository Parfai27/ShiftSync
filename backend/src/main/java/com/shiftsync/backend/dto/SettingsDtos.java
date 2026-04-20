package com.shiftsync.backend.dto;

public final class SettingsDtos {

    private SettingsDtos() {
    }

    public record ManagerSettingsResponse(
        boolean allowShiftSwaps,
        boolean enforceMaxHours,
        boolean notifyManagersOnUrgentChanges
    ) {
    }

    public record AdminSettingsResponse(
        String defaultTimezone,
        boolean auditLoggingEnabled,
        boolean publicApiEnabled
    ) {
    }
}
