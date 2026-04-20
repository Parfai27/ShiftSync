package com.shiftsync.backend.service;

import com.shiftsync.backend.model.Announcement;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.repository.AnnouncementRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private final NotificationRepository notificationRepository;
    private final AnnouncementRepository announcementRepository;

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Announcement> getAnnouncementsForBranch(Long branchId) {
        return announcementRepository.findByBranchIdOrderByPublishedAtDesc(branchId);
    }
}
