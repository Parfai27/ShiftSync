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
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Choose whether to approve or reject the adjustment.")
        AdjustmentStatus status,
        String note
    ) {
    }

    public record NotificationUpdateRequest(
        @NotNull(message = "Notification state is required.")
        Boolean read
    ) {
    }

    public record EmployeeUpdateRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotBlank(message = "Employee full name is required.")
        String fullName,
        @Email(message = "Enter a valid email address.")
        @NotBlank(message = "Employee email is required.")
        String email,
        @NotBlank(message = "Employee job title is required.")
        String jobTitle,
        String phoneNumber
    ) {
    }

    public record EmployeeArchiveRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId
    ) {
    }

    public record EmployeeStatusUpdateRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Account status is required.")
        Boolean active
    ) {
    }

    public record EmployeeCreateRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotBlank(message = "Employee full name is required.")
        String fullName,
        @Email(message = "Enter a valid email address.")
        @NotBlank(message = "Employee email is required.")
        String email,
        @NotBlank(message = "Employee job title is required.")
        String jobTitle,
        String phoneNumber,
        LocalDate hireDate
    ) {
    }

    public record EmployeeCreateResponse(
        Long userId,
        String fullName,
        String email,
        String employeeCode,
        Boolean emailDelivered,
        String temporaryPassword,
        String message
    ) {
    }

    public record CompliancePolicyCreateRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotBlank(message = "Policy title is required.")
        String title,
        @NotBlank(message = "Policy description is required.")
        String description,
        @NotBlank(message = "Policy category is required.")
        String category,
        Boolean active
    ) {
    }

    public record CompliancePolicyStatusUpdateRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Policy status is required.")
        Boolean active
    ) {
    }

    public record SettingsUpdateRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId,
        @NotNull(message = "Salary visibility setting is required.")
        Boolean showSalaries,
        @NotNull(message = "Phone number visibility setting is required.")
        Boolean showPhoneNumbers,
        @NotNull(message = "Public profile visibility setting is required.")
        Boolean publicProfiles,
        @NotNull(message = "Auto-scheduling setting is required.")
        Boolean autoSchedulingEnabled,
        @NotBlank(message = "Shift swap approval mode is required.")
        String shiftSwapApprovalMode,
        @NotBlank(message = "Work week start day is required.")
        String workWeekStartDay,
        @NotNull(message = "Overtime threshold is required.")
        Integer overtimeThresholdHours,
        @NotBlank(message = "Currency and localization setting is required.")
        String currencyLocalization,
        @NotBlank(message = "Department focus is required.")
        String departmentName
    ) {
    }

    public record TeamArchiveRequest(
        @NotNull(message = "Manager session is required.")
        Long managerId
    ) {
    }
}
