package com.shiftsync.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class Branch extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BranchType type;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean showSalaries = false;

    @Column(nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private boolean showPhoneNumbers = true;

    @Column(nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private boolean publicProfiles = true;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean autoSchedulingEnabled = false;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'Manual Review'")
    @Builder.Default
    private String shiftSwapApprovalMode = "Manual Review";

    @Column(nullable = false, columnDefinition = "varchar(255) default 'Monday'")
    @Builder.Default
    private String workWeekStartDay = "Monday";

    @Column(nullable = false, columnDefinition = "integer default 40")
    @Builder.Default
    private Integer overtimeThresholdHours = 40;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'RWF - Rwanda'")
    @Builder.Default
    private String currencyLocalization = "RWF - Rwanda";

    @Column(nullable = false, columnDefinition = "varchar(255) default 'Operations & Dispensing'")
    @Builder.Default
    private String departmentName = "Operations & Dispensing";
}
