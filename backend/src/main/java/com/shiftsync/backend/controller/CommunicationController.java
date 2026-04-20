package com.shiftsync.backend.controller;

import com.shiftsync.backend.model.Announcement;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.service.CommunicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/communication")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    @GetMapping("/notifications/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return communicationService.getNotificationsForUser(userId);
    }

    @GetMapping("/announcements/{branchId}")
    public List<Announcement> getAnnouncements(@PathVariable Long branchId) {
        return communicationService.getAnnouncementsForBranch(branchId);
    }
}
