package com.shiftsync.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class SystemSetting extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String settingKey;

    @Column(nullable = false)
    @Builder.Default
    private String defaultTimezone = "Africa/Kigali";

    @Column(nullable = false)
    @Builder.Default
    private boolean auditLoggingEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean publicApiEnabled = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowShiftSwaps = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean enforceMaxHours = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean notifyManagersOnUrgentChanges = true;

    @Column(nullable = false)
    @Builder.Default
    private String aiBaseUrl = "https://api.openai.com/v1";

    @Column(nullable = false)
    @Builder.Default
    private String aiModel = "gpt-4o-mini";
}
