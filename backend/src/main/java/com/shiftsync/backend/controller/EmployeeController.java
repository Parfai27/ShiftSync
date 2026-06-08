package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAnnouncementsPageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeEarningsPageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeProfilePageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeProfileUpdateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAdjustmentCreateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSettingsResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSettingsUpdateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSwapResponseRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeOverviewResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeNotificationsPageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSchedulePageResponse;
import com.shiftsync.backend.service.EmployeeOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeOverviewService employeeOverviewService;

    @GetMapping("/overview/{userId}")
    public EmployeeOverviewResponse getOverview(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeOverview(userId);
    }

    @GetMapping("/schedule/{userId}")
    public EmployeeSchedulePageResponse getSchedule(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeSchedule(userId);
    }

    @GetMapping("/notifications/{userId}")
    public EmployeeNotificationsPageResponse getNotifications(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeNotifications(userId);
    }

    @GetMapping("/announcements/{userId}")
    public EmployeeAnnouncementsPageResponse getAnnouncements(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeAnnouncements(userId);
    }

    @GetMapping("/earnings/{userId}")
    public EmployeeEarningsPageResponse getEarnings(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeEarnings(userId);
    }

    @GetMapping("/profile/{userId}")
    public EmployeeProfilePageResponse getProfile(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeProfile(userId);
    }

    @PutMapping("/profile/{userId}")
    public EmployeeProfilePageResponse updateProfile(
        @PathVariable Long userId,
        @RequestBody EmployeeProfileUpdateRequest request
    ) {
        return employeeOverviewService.updateEmployeeProfile(userId, request);
    }

    @GetMapping("/settings/{userId}")
    public EmployeeSettingsResponse getSettings(@PathVariable Long userId) {
        return employeeOverviewService.getEmployeeSettings(userId);
    }

    @PutMapping("/settings/{userId}")
    public EmployeeSettingsResponse updateSettings(
        @PathVariable Long userId,
        @RequestBody EmployeeSettingsUpdateRequest request
    ) {
        return employeeOverviewService.updateEmployeeSettings(userId, request);
    }

    @PatchMapping("/notifications/{userId}/{notificationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateNotification(
        @PathVariable Long userId,
        @PathVariable Long notificationId,
        @RequestBody java.util.Map<String, Boolean> payload
    ) {
        employeeOverviewService.updateEmployeeNotification(userId, notificationId, Boolean.TRUE.equals(payload.get("read")));
    }

    @PostMapping("/notifications/{userId}/mark-all-read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllNotificationsRead(@PathVariable Long userId) {
        employeeOverviewService.markAllEmployeeNotificationsRead(userId);
    }

    @PostMapping("/time-off/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void requestTimeOff(
        @PathVariable Long userId,
        @RequestBody(required = false) java.util.Map<String, String> payload
    ) {
        employeeOverviewService.requestEmployeeTimeOff(userId, payload == null ? null : payload.get("note"));
    }

    @PostMapping("/attendance/{userId}/{shiftId}/clock-in")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clockInShift(
        @PathVariable Long userId,
        @PathVariable Long shiftId
    ) {
        employeeOverviewService.clockInShift(userId, shiftId);
    }

    @PostMapping("/attendance/{userId}/{shiftId}/clock-out")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clockOutShift(
        @PathVariable Long userId,
        @PathVariable Long shiftId
    ) {
        employeeOverviewService.clockOutShift(userId, shiftId);
    }

    @PostMapping("/contact-manager/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void contactManager(
        @PathVariable Long userId,
        @RequestBody(required = false) java.util.Map<String, String> payload
    ) {
        employeeOverviewService.contactManager(userId, payload == null ? null : payload.get("message"));
    }

    @PostMapping("/adjustments/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void requestAdjustment(
        @PathVariable Long userId,
        @RequestBody EmployeeAdjustmentCreateRequest request
    ) {
        employeeOverviewService.requestShiftAdjustment(userId, request);
    }

    @PostMapping("/adjustments/{userId}/{adjustmentId}/swap-response")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void respondToSwap(
        @PathVariable Long userId,
        @PathVariable Long adjustmentId,
        @RequestBody EmployeeSwapResponseRequest request
    ) {
        employeeOverviewService.respondToSwapRequest(userId, adjustmentId, request);
    }
}
