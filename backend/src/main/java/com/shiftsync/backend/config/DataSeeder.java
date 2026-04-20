package com.shiftsync.backend.config;

import com.shiftsync.backend.model.Announcement;
import com.shiftsync.backend.model.Branch;
import com.shiftsync.backend.model.BranchType;
import com.shiftsync.backend.model.CompliancePolicy;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.model.NotificationPriority;
import com.shiftsync.backend.model.PayrollRecord;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.ShiftStatus;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.repository.AnnouncementRepository;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.CompliancePolicyRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.PayrollRecordRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final CompliancePolicyRepository compliancePolicyRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final ShiftAdjustmentRequestRepository shiftAdjustmentRequestRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Branch branch = branchRepository.findByCode("NGABO-MAIN")
            .orElseGet(() -> branchRepository.save(
                Branch.builder()
                    .name("Ngabo Pharmacy - Main Branch")
                    .code("NGABO-MAIN")
                    .location("Kigali, Rwanda")
                    .type(BranchType.RETAIL_PHARMACY)
                    .active(true)
                    .build()
            ));

        User admin = userRepository.findByUsername("admin")
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .fullName("System Administrator")
                    .username("admin")
                    .email("admin@shiftsync.local")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .branch(branch)
                    .active(true)
                    .build()
            ));

        User manager = userRepository.findByUsername("manager")
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .fullName("Aline Uwimana")
                    .username("manager")
                    .email("manager@ngabopharmacy.rw")
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .role(Role.MANAGER)
                    .branch(branch)
                    .active(true)
                    .build()
            ));

        User pharmacist = userRepository.findByUsername("employee")
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .fullName("Eric Ndayisaba")
                    .username("employee")
                    .email("employee@ngabopharmacy.rw")
                    .passwordHash(passwordEncoder.encode("employee123"))
                    .role(Role.EMPLOYEE)
                    .branch(branch)
                    .active(true)
                    .build()
            ));

        if (shiftRepository.count() == 0) {
            shiftRepository.saveAll(List.of(
                Shift.builder()
                    .name("Morning Shift")
                    .branch(branch)
                    .shiftDate(LocalDate.now().plusDays(1))
                    .startTime(LocalTime.of(8, 0))
                    .endTime(LocalTime.of(16, 0))
                    .requiredStaff(4)
                    .assignedStaff(3)
                    .status(ShiftStatus.PARTIALLY_STAFFED)
                    .build(),
                Shift.builder()
                    .name("Evening Shift")
                    .branch(branch)
                    .shiftDate(LocalDate.now().plusDays(2))
                    .startTime(LocalTime.of(16, 0))
                    .endTime(LocalTime.of(23, 0))
                    .requiredStaff(3)
                    .assignedStaff(3)
                    .status(ShiftStatus.FULL)
                    .build(),
                Shift.builder()
                    .name("Weekend Shift")
                    .branch(branch)
                    .shiftDate(LocalDate.now().plusDays(4))
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .requiredStaff(2)
                    .assignedStaff(1)
                    .status(ShiftStatus.PARTIALLY_STAFFED)
                    .build()
            ));
        }

        List<Shift> shifts = shiftRepository.findAll();

        if (shiftAssignmentRepository.count() == 0) {
            shifts.stream()
                .limit(3)
                .forEach(shift -> shiftAssignmentRepository.save(
                    ShiftAssignment.builder()
                        .shift(shift)
                        .employee(pharmacist)
                        .assignedAt(LocalDateTime.now().minusDays(1))
                        .build()
                ));
        }

        if (shiftAdjustmentRequestRepository.count() == 0 && !shifts.isEmpty()) {
            shiftAdjustmentRequestRepository.saveAll(List.of(
                ShiftAdjustmentRequest.builder()
                    .employee(pharmacist)
                    .shift(shifts.get(0))
                    .adjustmentType("Shift Swap")
                    .requestedChange("Swap with evening shift on next available date")
                    .status(AdjustmentStatus.APPROVED)
                    .reviewedAt(LocalDateTime.now().minusHours(4))
                    .build(),
                ShiftAdjustmentRequest.builder()
                    .employee(pharmacist)
                    .shift(shifts.get(1))
                    .adjustmentType("Overtime Request")
                    .requestedChange("Extend shift by 2 hours for stock reconciliation")
                    .status(AdjustmentStatus.PENDING)
                    .build()
            ));
        }

        if (announcementRepository.count() == 0) {
            announcementRepository.save(
                Announcement.builder()
                    .title("Controlled medicines audit scheduled")
                    .message("Prepare dispensing and stock records for the weekly compliance review.")
                    .branch(branch)
                    .publishedBy(admin)
                    .publishedAt(LocalDateTime.now())
                    .build()
            );
        }

        if (notificationRepository.count() == 0) {
            notificationRepository.saveAll(List.of(
                Notification.builder()
                    .title("Shift adjustment pending")
                    .message("A schedule change request requires manager review.")
                    .priority(NotificationPriority.HIGH)
                    .recipient(manager)
                    .read(false)
                    .build(),
                Notification.builder()
                    .title("Upcoming pharmacy shift")
                    .message("Your morning shift at Ngabo Pharmacy starts tomorrow at 08:00.")
                    .priority(NotificationPriority.MEDIUM)
                    .recipient(pharmacist)
                    .read(false)
                    .build(),
                Notification.builder()
                    .title("Announcement posted")
                    .message("A new branch operations announcement is available.")
                    .priority(NotificationPriority.LOW)
                    .recipient(pharmacist)
                    .read(false)
                    .build()
            ));
        }

        if (compliancePolicyRepository.count() == 0) {
            compliancePolicyRepository.save(
                CompliancePolicy.builder()
                    .title("Maximum daily working hours")
                    .description("Employees should not exceed 8 scheduled hours per day without approved overtime.")
                    .category("Scheduling")
                    .active(true)
                    .branch(branch)
                    .build()
            );
        }

        if (payrollRecordRepository.count() == 0) {
            payrollRecordRepository.save(
                PayrollRecord.builder()
                    .employee(pharmacist)
                    .periodStart(LocalDate.now().minusDays(14))
                    .periodEnd(LocalDate.now())
                    .regularHours(new BigDecimal("32.5"))
                    .overtimeHours(new BigDecimal("2.0"))
                    .grossPay(new BigDecimal("1420.00"))
                    .build()
            );
        }

        if (auditLogRepository.count() == 0) {
            auditLogRepository.saveAll(List.of(
                AuditLog.builder()
                    .actor(admin)
                    .action("Updated pharmacy staffing policy")
                    .targetModule("Compliance")
                    .actionTime(LocalDateTime.now().minusHours(2))
                    .details("Adjusted maximum overlap threshold for opening shift coverage.")
                    .build(),
                AuditLog.builder()
                    .actor(manager)
                    .action("Approved shift adjustment")
                    .targetModule("Scheduling")
                    .actionTime(LocalDateTime.now().minusHours(5))
                    .details("Approved schedule change for employee coverage continuity.")
                    .build(),
                AuditLog.builder()
                    .actor(admin)
                    .action("Reviewed branch notification queue")
                    .targetModule("Notifications")
                    .actionTime(LocalDateTime.now().minusDays(1))
                    .details("Confirmed branch-wide messages were delivered successfully.")
                    .build()
            ));
        }
    }
}
