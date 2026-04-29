package com.shiftsync.backend.config;

import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.Announcement;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.Availability;
import com.shiftsync.backend.model.AvailabilityStatus;
import com.shiftsync.backend.model.Branch;
import com.shiftsync.backend.model.BranchType;
import com.shiftsync.backend.model.CompliancePolicy;
import com.shiftsync.backend.model.EmployeeProfile;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.model.NotificationPriority;
import com.shiftsync.backend.model.PayrollRecord;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.ShiftStatus;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AnnouncementRepository;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.AvailabilityRepository;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.CompliancePolicyRepository;
import com.shiftsync.backend.repository.EmployeeProfileRepository;
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
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final Set<String> CANONICAL_SHIFT_NAMES = Set.of("Evening Shift", "1st Shift", "2nd Shift");


    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final ShiftAdjustmentRequestRepository shiftAdjustmentRequestRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final CompliancePolicyRepository compliancePolicyRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Branch branch = branchRepository.findByCode("NGABO-MAIN")
            .map(existing -> updateBranch(existing, "Ngabo Pharmacy", "Kigali, Rwanda"))
            .orElseGet(() -> branchRepository.save(
                Branch.builder()
                    .name("Ngabo Pharmacy")
                    .code("NGABO-MAIN")
                    .location("Kigali, Rwanda")
                    .type(BranchType.RETAIL_PHARMACY)
                    .active(true)
                    .build()
            ));

        removeLegacyShiftModelData(branch);

        User admin = upsertUser(
            "admin",
            "System Administrator",
            "admin@shiftsync.local",
            "admin123",
            Role.ADMIN,
            branch,
            "https://ui-avatars.com/api/?name=System+Administrator&background=0f51ff&color=ffffff"
        );

        User manager = upsertUser(
            "manager",
            "Aline Uwimana",
            "manager@ngabopharmacy.rw",
            "manager123",
            Role.MANAGER,
            branch,
            "https://ui-avatars.com/api/?name=Aline+Uwimana&background=0f51ff&color=ffffff"
        );

        User pharmacist = upsertUser(
            "employee",
            "Eric Ndayisaba",
            "employee@ngabopharmacy.rw",
            "employee123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Eric+Ndayisaba&background=0f51ff&color=ffffff"
        );

        User staff1 = upsertUser(
            "frida.mukamana",
            "Frida Mukamana",
            "frida.mukamana@ngabopharmacy.rw",
            "frida123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Frida+Mukamana&background=5a6fc3&color=ffffff"
        );
        User staff2 = upsertUser(
            "patrick.habimana",
            "Patrick Habimana",
            "patrick.habimana@ngabopharmacy.rw",
            "patrick123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Patrick+Habimana&background=4d63b8&color=ffffff"
        );
        User staff3 = upsertUser(
            "grace.uwase",
            "Grace Uwase",
            "grace.uwase@ngabopharmacy.rw",
            "grace123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Grace+Uwase&background=3150ba&color=ffffff"
        );
        User staff4 = upsertUser(
            "claude.irakoze",
            "Claude Irakoze",
            "claude.irakoze@ngabopharmacy.rw",
            "claude123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Claude+Irakoze&background=2747b3&color=ffffff"
        );
        User staff5 = upsertUser(
            "pacifique.mugisha",
            "Pacifique Mugisha",
            "pacifique.mugisha@ngabopharmacy.rw",
            "pacifique123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Pacifique+Mugisha&background=1e40af&color=ffffff"
        );
        User staff6 = upsertUser(
            "brenda.uwingabiye",
            "Brenda Uwingabiye",
            "brenda.uwingabiye@ngabopharmacy.rw",
            "brenda123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Brenda+Uwingabiye&background=3730a3&color=ffffff"
        );
        User staff7 = upsertUser(
            "jeanclaude.hategekimana",
            "Jean Claude Hategekimana",
            "jeanclaude.hategekimana@ngabopharmacy.rw",
            "jeanclaude123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Jean+Claude+Hategekimana&background=2563eb&color=ffffff"
        );
        User staff8 = upsertUser(
            "chantal.mukantwari",
            "Chantal Mukantwari",
            "chantal.mukantwari@ngabopharmacy.rw",
            "chantal123",
            Role.EMPLOYEE,
            branch,
            "https://ui-avatars.com/api/?name=Chantal+Mukantwari&background=1d4ed8&color=ffffff"
        );

        upsertProfile(manager, "MGR-001", "Shift Manager", "0788001101", LocalDate.of(2021, 3, 14), "0788001199");
        upsertProfile(pharmacist, "EMP-101", "Pharmacist", "0788002201", LocalDate.of(2022, 5, 18), "0788002299");
        upsertProfile(staff1, "EMP-102", "Pharmacy Assistant / Attendant", "0788002202", LocalDate.of(2023, 1, 9), "0788002298");
        upsertProfile(staff2, "EMP-103", "Store Officer", "0788002203", LocalDate.of(2022, 8, 2), "0788002297");
        upsertProfile(staff3, "EMP-104", "Cashier", "0788002204", LocalDate.of(2024, 2, 12), "0788002296");
        upsertProfile(staff4, "EMP-105", "Pharmacist", "0788002205", LocalDate.of(2023, 11, 3), "0788002295");
        upsertProfile(staff5, "EMP-106", "Pharmacy Assistant / Attendant", "0788002206", LocalDate.of(2023, 7, 20), "0788002294");
        upsertProfile(staff6, "EMP-107", "Store Officer", "0788002207", LocalDate.of(2022, 12, 6), "0788002293");
        upsertProfile(staff7, "EMP-108", "Cashier", "0788002208", LocalDate.of(2024, 1, 18), "0788002292");
        upsertProfile(staff8, "EMP-109", "Pharmacist", "0788002209", LocalDate.of(2024, 4, 3), "0788002291");

        LocalDate weekStart = LocalDate.now().with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.MONDAY));
        Shift mondayNight = upsertShift(branch, "Evening Shift", weekStart, LocalTime.of(23, 0), LocalTime.of(7, 0), 4, 4, ShiftStatus.FULL);
        Shift mondayFirst = upsertShift(branch, "1st Shift", weekStart, LocalTime.of(7, 0), LocalTime.of(15, 0), 4, 4, ShiftStatus.FULL);
        Shift mondaySecond = upsertShift(branch, "2nd Shift", weekStart, LocalTime.of(15, 0), LocalTime.of(23, 0), 4, 3, ShiftStatus.PARTIALLY_STAFFED);
        Shift tuesdayNight = upsertShift(branch, "Evening Shift", weekStart.plusDays(1), LocalTime.of(23, 0), LocalTime.of(7, 0), 4, 2, ShiftStatus.UNDERSTAFFED);

        upsertAssignment(mondayNight, pharmacist, LocalDateTime.now().minusDays(2));
        upsertAssignment(mondayNight, staff1, LocalDateTime.now().minusDays(2));
        upsertAssignment(mondayNight, staff2, LocalDateTime.now().minusDays(2));
        upsertAssignment(mondayNight, staff3, LocalDateTime.now().minusDays(2));

        upsertAssignment(mondayFirst, staff4, LocalDateTime.now().minusDays(2));
        upsertAssignment(mondayFirst, staff5, LocalDateTime.now().minusDays(2));
        upsertAssignment(mondayFirst, staff6, LocalDateTime.now().minusDays(2));
        upsertAssignment(mondayFirst, staff7, LocalDateTime.now().minusDays(2));

        upsertAssignment(mondaySecond, staff8, LocalDateTime.now().minusDays(1));
        upsertAssignment(mondaySecond, staff1, LocalDateTime.now().minusDays(1));
        upsertAssignment(mondaySecond, staff2, LocalDateTime.now().minusDays(1));

        upsertAssignment(tuesdayNight, staff4, LocalDateTime.now().minusHours(10));
        upsertAssignment(tuesdayNight, staff5, LocalDateTime.now().minusHours(10));

        upsertAvailability(staff3, weekStart.plusDays(1), AvailabilityStatus.PREFERRED, LocalTime.of(23, 0), LocalTime.of(7, 0), "Available for overnight cashier coverage.");
        upsertAvailability(staff6, weekStart.plusDays(1), AvailabilityStatus.AVAILABLE, LocalTime.of(23, 0), LocalTime.of(7, 0), "Ready for overnight store supervision.");
        upsertAvailability(staff7, weekStart.plusDays(2), AvailabilityStatus.UNAVAILABLE, null, null, "Off duty for personal leave.");

        upsertAdjustment(pharmacist, mondaySecond, "Shift Swap", "Swap the second shift with another pharmacist for the Tuesday evening rotation.", AdjustmentStatus.PENDING, null);
        upsertAdjustment(staff2, tuesdayNight, "Overtime Request", "Extend the overnight store officer coverage by one hour for stock receiving.", AdjustmentStatus.APPROVED, LocalDateTime.now().minusHours(6));
        upsertAdjustment(staff3, mondayNight, "Time Off Request", "Request leave from the overnight cashier shift for a family commitment.", AdjustmentStatus.REJECTED, LocalDateTime.now().minusDays(1));

        upsertAnnouncement(
            branch,
            admin,
            "Controlled medicines audit scheduled",
            "Prepare narcotics register entries, cold-chain logs, and dispensing records before tomorrow's compliance review.",
            LocalDateTime.now().minusHours(8)
        );
        upsertAnnouncement(
            branch,
            manager,
            "Weekend vaccination outreach",
            "Weekend coverage must preserve prescription dispensing, vaccine stock handling, and cashier support at all times.",
            LocalDateTime.now().minusDays(1)
        );

        upsertNotification(manager, "Urgent: overnight shift below safe coverage", "The evening shift on " + tuesdayNight.getShiftDate() + " still requires cashier and store officer coverage.", NotificationPriority.HIGH, false);
        upsertNotification(manager, "Shift swap request awaiting review", "Eric Ndayisaba submitted a live shift adjustment request for the second shift rota.", NotificationPriority.MEDIUM, false);
        upsertNotification(manager, "Compliance reminder", "Controlled medicines documentation is due before branch opening tomorrow.", NotificationPriority.LOW, true);
        upsertNotification(pharmacist, "Upcoming overnight shift", "You are scheduled for overnight pharmacist coverage at 23:00.", NotificationPriority.MEDIUM, false);

        upsertPolicy(branch, "Maximum Weekly Hours", "Staff may not exceed 48 total hours within a rolling 7-day period without branch manager approval.", "Scheduling", true);
        upsertPolicy(branch, "Mandatory Rest Period", "Maintain at least 11 continuous hours between closing and opening shifts for all pharmacy staff.", "Scheduling", true);
        upsertPolicy(branch, "Controlled Medicines Register", "Every controlled medicines movement must be recorded during the same service window.", "Compliance", true);

        upsertPayroll(pharmacist, LocalDate.now().minusDays(14), LocalDate.now(), new BigDecimal("72.0"), new BigDecimal("4.0"), new BigDecimal("186000.00"));
        upsertPayroll(staff2, LocalDate.now().minusDays(14), LocalDate.now(), new BigDecimal("68.0"), new BigDecimal("2.0"), new BigDecimal("171500.00"));

        upsertAuditLog(admin, "Updated pharmacy staffing policy", "Compliance", LocalDateTime.now().minusHours(9), "Reinforced handover coverage for controlled medicines at branch close.");
        upsertAuditLog(manager, "Approved overtime request", "Scheduling", LocalDateTime.now().minusHours(6), "Approved extended inventory balancing support for the overnight store coverage.");
        upsertAuditLog(manager, "Reviewed branch notification queue", "Notifications", LocalDateTime.now().minusHours(3), "Cleared one completed reminder and left urgent items active for follow-up.");
    }

    private Branch updateBranch(Branch branch, String name, String location) {
        branch.setName(name);
        branch.setLocation(location);
        branch.setType(BranchType.RETAIL_PHARMACY);
        branch.setActive(true);
        return branchRepository.save(branch);
    }

    private void removeLegacyShiftModelData(Branch branch) {
        List<Shift> legacyShifts = shiftRepository.findByBranchId(branch.getId()).stream()
            .filter(shift -> shift.getName() == null || !CANONICAL_SHIFT_NAMES.contains(shift.getName()))
            .toList();

        if (legacyShifts.isEmpty()) {
            return;
        }

        for (Shift shift : legacyShifts) {
            shiftAdjustmentRequestRepository.deleteAll(
                shiftAdjustmentRequestRepository.findAll().stream()
                    .filter(request -> request.getShift() != null && request.getShift().getId().equals(shift.getId()))
                    .toList()
            );
            shiftAssignmentRepository.deleteAll(shiftAssignmentRepository.findByShiftId(shift.getId()));
        }

        shiftRepository.deleteAll(legacyShifts);
    }

    private User upsertUser(String username, String fullName, String email, String rawPassword, Role role, Branch branch, String profileImageUrl) {
        User user = userRepository.findByUsername(username).orElseGet(User::new);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setBranch(branch);
        user.setActive(true);
        user.setProfileImageUrl(profileImageUrl);
        return userRepository.save(user);
    }

    private void upsertProfile(User user, String code, String title, String phone, LocalDate hireDate, String emergencyPhone) {
        EmployeeProfile profile = employeeProfileRepository.findByUserId(user.getId()).orElseGet(EmployeeProfile::new);
        profile.setUser(user);
        profile.setEmployeeCode(code);
        profile.setJobTitle(title);
        profile.setPhoneNumber(phone);
        profile.setHireDate(hireDate);
        profile.setHourlyRate(new BigDecimal("2500.00"));
        profile.setEmergencyContactName("Primary Contact");
        profile.setEmergencyContactPhone(emergencyPhone);
        employeeProfileRepository.save(profile);
    }

    private Shift upsertShift(Branch branch, String name, LocalDate date, LocalTime start, LocalTime end, int required, int assigned, ShiftStatus status) {
        Shift shift = shiftRepository.findByBranchId(branch.getId()).stream()
            .filter(existing -> existing.getName().equals(name) && existing.getShiftDate().equals(date))
            .findFirst()
            .orElseGet(Shift::new);
        shift.setName(name);
        shift.setBranch(branch);
        shift.setShiftDate(date);
        shift.setStartTime(start);
        shift.setEndTime(end);
        shift.setRequiredStaff(required);
        shift.setAssignedStaff(assigned);
        shift.setStatus(status);
        return shiftRepository.save(shift);
    }

    private void upsertAssignment(Shift shift, User employee, LocalDateTime assignedAt) {
        boolean exists = shiftAssignmentRepository.findByShiftId(shift.getId()).stream()
            .anyMatch(item -> item.getEmployee().getId().equals(employee.getId()));
        if (!exists) {
            shiftAssignmentRepository.save(
                ShiftAssignment.builder()
                    .shift(shift)
                    .employee(employee)
                    .assignedAt(assignedAt)
                    .build()
            );
        }
    }

    private void upsertAvailability(User employee, LocalDate date, AvailabilityStatus status, LocalTime start, LocalTime end, String notes) {
        boolean exists = availabilityRepository.findByEmployeeId(employee.getId()).stream()
            .anyMatch(item -> item.getAvailableDate().equals(date));
        if (!exists) {
            availabilityRepository.save(
                Availability.builder()
                    .employee(employee)
                    .availableDate(date)
                    .startTime(start)
                    .endTime(end)
                    .status(status)
                    .notes(notes)
                    .build()
            );
        }
    }

    private void upsertAdjustment(User employee, Shift shift, String type, String change, AdjustmentStatus status, LocalDateTime reviewedAt) {
        boolean exists = shiftAdjustmentRequestRepository.findByEmployeeId(employee.getId()).stream()
            .anyMatch(item -> item.getShift().getId().equals(shift.getId()) && item.getAdjustmentType().equals(type));
        if (!exists) {
            shiftAdjustmentRequestRepository.save(
                ShiftAdjustmentRequest.builder()
                    .employee(employee)
                    .shift(shift)
                    .adjustmentType(type)
                    .requestedChange(change)
                    .status(status)
                    .reviewedAt(reviewedAt)
                    .build()
            );
        }
    }

    private void upsertAnnouncement(Branch branch, User publishedBy, String title, String message, LocalDateTime publishedAt) {
        boolean exists = announcementRepository.findByBranchIdOrderByPublishedAtDesc(branch.getId()).stream()
            .anyMatch(item -> item.getTitle().equals(title));
        if (!exists) {
            announcementRepository.save(
                Announcement.builder()
                    .title(title)
                    .message(message)
                    .branch(branch)
                    .publishedBy(publishedBy)
                    .publishedAt(publishedAt)
                    .build()
            );
        }
    }

    private void upsertNotification(User recipient, String title, String message, NotificationPriority priority, boolean read) {
        boolean exists = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipient.getId()).stream()
            .anyMatch(item -> item.getTitle().equals(title));
        if (!exists) {
            notificationRepository.save(
                Notification.builder()
                    .title(title)
                    .message(message)
                    .priority(priority)
                    .recipient(recipient)
                    .read(read)
                    .build()
            );
        }
    }

    private void upsertPolicy(Branch branch, String title, String description, String category, boolean active) {
        boolean exists = compliancePolicyRepository.findByBranchId(branch.getId()).stream()
            .anyMatch(item -> item.getTitle().equals(title));
        if (!exists) {
            compliancePolicyRepository.save(
                CompliancePolicy.builder()
                    .title(title)
                    .description(description)
                    .category(category)
                    .active(active)
                    .branch(branch)
                    .build()
            );
        }
    }

    private void upsertPayroll(User employee, LocalDate start, LocalDate end, BigDecimal regularHours, BigDecimal overtimeHours, BigDecimal grossPay) {
        boolean exists = payrollRecordRepository.findAll().stream()
            .anyMatch(item -> item.getEmployee().getId().equals(employee.getId()) && item.getPeriodEnd().equals(end));
        if (!exists) {
            payrollRecordRepository.save(
                PayrollRecord.builder()
                    .employee(employee)
                    .periodStart(start)
                    .periodEnd(end)
                    .regularHours(regularHours)
                    .overtimeHours(overtimeHours)
                    .grossPay(grossPay)
                    .build()
            );
        }
    }

    private void upsertAuditLog(User actor, String action, String module, LocalDateTime actionTime, String details) {
        boolean exists = auditLogRepository.findTop20ByOrderByActionTimeDesc().stream()
            .anyMatch(item -> item.getAction().equals(action) && item.getDetails().equals(details));
        if (!exists) {
            auditLogRepository.save(
                AuditLog.builder()
                    .actor(actor)
                    .action(action)
                    .targetModule(module)
                    .actionTime(actionTime)
                    .details(details)
                    .build()
            );
        }
    }
}
