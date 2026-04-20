package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.Announcement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByBranchIdOrderByPublishedAtDesc(Long branchId);
}
