package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.AuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop20ByOrderByActionTimeDesc();
    boolean existsByActionAndTargetModuleAndDetailsContaining(String action, String targetModule, String details);
    void deleteByActorId(Long actorId);
}
