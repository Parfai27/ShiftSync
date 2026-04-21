package com.shiftsync.backend.dto;

import com.shiftsync.backend.model.AdjustmentStatus;
import jakarta.validation.constraints.NotNull;

public final class ManagerActionDtos {

    private ManagerActionDtos() {
    }

    public record AdjustmentDecisionRequest(
        @NotNull Long managerId,
        @NotNull AdjustmentStatus status,
        String note
    ) {
    }

    public record NotificationUpdateRequest(
        @NotNull Boolean read
    ) {
    }
}
