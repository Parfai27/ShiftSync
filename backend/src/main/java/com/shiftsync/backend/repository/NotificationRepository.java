package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    void deleteByRecipientId(Long recipientId);
}
