package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.SystemSetting;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
    Optional<SystemSetting> findTopByOrderByIdAsc();
}
