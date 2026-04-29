package com.shiftsync.backend.dto;

import com.shiftsync.backend.model.AdjustmentStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

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

    public record EmployeeUpdateRequest(
        @NotNull Long managerId,
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank String jobTitle,
        String phoneNumber
    ) {
    }

    public record EmployeeArchiveRequest(
        @NotNull Long managerId
    ) {
    }

    public record EmployeeCreateRequest(
        @NotNull Long managerId,
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank String jobTitle,
        String phoneNumber,
        LocalDate hireDate
    ) {
    }

    public record EmployeeCreateResponse(
        Long userId,
        String fullName,
        String email,
        String employeeCode,
        String temporaryPassword,
        String message
    ) {
    }

    public record CompliancePolicyCreateRequest(
        @NotNull Long managerId,
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String category,
        Boolean active
    ) {
    }

    public record CompliancePolicyStatusUpdateRequest(
        @NotNull Long managerId,
        @NotNull Boolean active
    ) {
    }

    public record SettingsUpdateRequest(
        @NotNull Long managerId,
        @NotNull Boolean showSalaries,
        @NotNull Boolean showPhoneNumbers,
        @NotNull Boolean publicProfiles,
        @NotNull Boolean autoSchedulingEnabled,
        @NotBlank String shiftSwapApprovalMode,
        @NotBlank String workWeekStartDay,
        @NotNull Integer overtimeThresholdHours,
        @NotBlank String currencyLocalization,
        @NotBlank String departmentName
    ) {
    }

    public record TeamArchiveRequest(
        @NotNull Long managerId
    ) {
    }
}
