package com.shiftsync.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import java.math.BigDecimal;
import java.time.LocalDate;
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
public class EmployeeProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String employeeCode;

    @Column(nullable = false)
    private String jobTitle;

    @Column(length = 1000)
    private String coreExpertise;

    private String phoneNumber;

    private LocalDate hireDate;

    private BigDecimal hourlyRate;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private Boolean notifyScheduleChanges;

    private Boolean notifyCompanyNews;

    private Boolean notifyTeamMessages;

    private Boolean hideProfile;

    private Boolean quietHoursEnabled;
}
