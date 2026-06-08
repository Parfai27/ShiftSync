package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.ManagerActionDtos.AdjustmentDecisionRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.CompliancePolicyCreateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.CompliancePolicyStatusUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeCreateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeCreateResponse;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeArchiveRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeDeleteRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeStatusUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.NotificationUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.SettingsUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.TeamArchiveRequest;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.EmployeeDetail;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ManagerWorkspaceResponse;
import com.shiftsync.backend.service.ManagerWorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ManagerWorkspaceController {

    private final ManagerWorkspaceService managerWorkspaceService;

    @GetMapping("/workspace/{userId}")
    public ManagerWorkspaceResponse getWorkspace(
        @PathVariable Long userId,
        @RequestParam(name = "rangeDays", defaultValue = "7") int rangeDays
    ) {
        return managerWorkspaceService.getWorkspace(userId, rangeDays);
    }

    @GetMapping("/{managerId}/employees/{employeeId}")
    public EmployeeDetail getEmployeeDetail(
        @PathVariable Long managerId,
        @PathVariable Long employeeId
    ) {
        return managerWorkspaceService.getEmployeeDetail(managerId, employeeId);
    }

    @PostMapping("/employees")
    public EmployeeCreateResponse createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        return managerWorkspaceService.createEmployee(request);
    }

    @PostMapping("/policies")
    public void createCompliancePolicy(@Valid @RequestBody CompliancePolicyCreateRequest request) {
        managerWorkspaceService.createCompliancePolicy(request);
    }

    @PatchMapping("/adjustments/{adjustmentId}")
    public void decideAdjustment(
        @PathVariable Long adjustmentId,
        @Valid @RequestBody AdjustmentDecisionRequest request
    ) {
        managerWorkspaceService.decideAdjustment(adjustmentId, request);
    }

    @PatchMapping("/notifications/{managerId}/{notificationId}")
    public void updateNotification(
        @PathVariable Long managerId,
        @PathVariable Long notificationId,
        @Valid @RequestBody NotificationUpdateRequest request
    ) {
        managerWorkspaceService.updateNotification(managerId, notificationId, request);
    }

    @PatchMapping("/policies/{policyId}")
    public void updateCompliancePolicyStatus(
        @PathVariable Long policyId,
        @Valid @RequestBody CompliancePolicyStatusUpdateRequest request
    ) {
        managerWorkspaceService.updateCompliancePolicyStatus(policyId, request);
    }

    @PostMapping("/notifications/{managerId}/mark-all-read")
    public void markAllNotificationsRead(@PathVariable Long managerId) {
        managerWorkspaceService.markAllNotificationsRead(managerId);
    }

    @PutMapping("/employees/{employeeId}")
    public void updateEmployee(
        @PathVariable Long employeeId,
        @Valid @RequestBody EmployeeUpdateRequest request
    ) {
        managerWorkspaceService.updateEmployee(employeeId, request);
    }

    @PatchMapping("/employees/{employeeId}/archive")
    public void archiveEmployee(
        @PathVariable Long employeeId,
        @Valid @RequestBody EmployeeArchiveRequest request
    ) {
        managerWorkspaceService.archiveEmployee(employeeId, request);
    }

    @DeleteMapping("/employees/{employeeId}")
    public void deleteEmployee(
        @PathVariable Long employeeId,
        @Valid @RequestBody EmployeeDeleteRequest request
    ) {
        managerWorkspaceService.deleteEmployee(employeeId, request);
    }

    @PatchMapping("/employees/{employeeId}/status")
    public void updateEmployeeStatus(
        @PathVariable Long employeeId,
        @Valid @RequestBody EmployeeStatusUpdateRequest request
    ) {
        managerWorkspaceService.updateEmployeeStatus(employeeId, request);
    }

    @PutMapping("/settings")
    public void updateSettings(@Valid @RequestBody SettingsUpdateRequest request) {
        managerWorkspaceService.updateSettings(request);
    }

    @PostMapping("/settings/archive-team")
    public void archiveTeam(@Valid @RequestBody TeamArchiveRequest request) {
        managerWorkspaceService.archiveTeam(request);
    }
}
