package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.ManagerActionDtos.AdjustmentDecisionRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.NotificationUpdateRequest;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ManagerWorkspaceResponse;
import com.shiftsync.backend.service.ManagerWorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerWorkspaceController {

    private final ManagerWorkspaceService managerWorkspaceService;

    @GetMapping("/workspace/{userId}")
    public ManagerWorkspaceResponse getWorkspace(@PathVariable Long userId) {
        return managerWorkspaceService.getWorkspace(userId);
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

    @PostMapping("/notifications/{managerId}/mark-all-read")
    public void markAllNotificationsRead(@PathVariable Long managerId) {
        managerWorkspaceService.markAllNotificationsRead(managerId);
    }
}
