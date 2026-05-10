package com.shiftsync.backend.dto;

import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.AvailabilityStatus;
import com.shiftsync.backend.model.ShiftStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public final class SchedulingDtos {

    private SchedulingDtos() {
    }

    public record ShiftRequest(
        @NotBlank String name,
        @NotNull Long branchId,
        @NotNull LocalDate shiftDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull Integer requiredStaff
    ) {
    }

    public record AvailabilityRequest(
        @NotNull Long employeeId,
        @NotNull LocalDate availableDate,
        LocalTime startTime,
        LocalTime endTime,
        @NotNull AvailabilityStatus status,
        String notes
    ) {
    }

    public record AdjustmentRequestPayload(
        @NotNull Long employeeId,
        @NotNull Long shiftId,
        @NotBlank String adjustmentType,
        @NotBlank String requestedChange
    ) {
    }

    public record AdjustmentStatusUpdate(@NotNull AdjustmentStatus status) {
    }

    public record ManagerSchedulingActionRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId
    ) {
    }

    public record ManualShiftAssignmentRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Select an employee to assign.")
        Long employeeId,
        @NotNull(message = "Select a shift day.")
        LocalDate shiftDate,
        @NotBlank(message = "Select a shift.")
        String shiftName
    ) {
    }

    public record RemoveShiftAssignmentRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Select the employee assignment to remove.")
        Long employeeId,
        @NotNull(message = "Select a shift day.")
        LocalDate shiftDate,
        @NotBlank(message = "Select a shift.")
        String shiftName
    ) {
    }

    public record ReassignShiftAssignmentRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Current employee assignment is required.")
        Long currentEmployeeId,
        @NotNull(message = "Choose a replacement employee.")
        Long replacementEmployeeId,
        @NotNull(message = "Select a shift day.")
        LocalDate shiftDate,
        @NotBlank(message = "Select a shift.")
        String shiftName
    ) {
    }

    public record ShiftResponse(
        Long id,
        String name,
        LocalDate shiftDate,
        LocalTime startTime,
        LocalTime endTime,
        Integer requiredStaff,
        Integer assignedStaff,
        ShiftStatus status
    ) {
    }
}
