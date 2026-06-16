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
import com.shiftsync.backend.repository.DeletedSeedEmployeeRepository;
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
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final Set<String> CANONICAL_SHIFT_NAMES = Set.of("1st Shift", "2nd Shift");
    private static final Set<String> CORE_EMPLOYEE_USERNAMES = Set.of(
        "employee",
        "frida.mukamana",
        "patrick.habimana",
        "grace.uwase",
        "claude.irakoze",
        "pacifique.mugisha"
    );


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
    private final DeletedSeedEmployeeRepository deletedSeedEmployeeRepository;
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
        purgeExtraSeedEmployees(branch);

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

        User pharmacist = seedCoreEmployeeIfAllowed(
            "employee",
            "Eric Ndayisaba",
            "employee@ngabopharmacy.rw",
            "employee123",
            branch,
            "https://ui-avatars.com/api/?name=Eric+Ndayisaba&background=0f51ff&color=ffffff"
        );

        User staff1 = seedCoreEmployeeIfAllowed(
            "frida.mukamana",
            "Frida Mukamana",
            "frida.mukamana@ngabopharmacy.rw",
            "frida123",
            branch,
            "https://ui-avatars.com/api/?name=Frida+Mukamana&background=5a6fc3&color=ffffff"
        );
        User staff2 = seedCoreEmployeeIfAllowed(
            "patrick.habimana",
            "Patrick Habimana",
            "patrick.habimana@ngabopharmacy.rw",
            "patrick123",
            branch,
            "https://ui-avatars.com/api/?name=Patrick+Habimana&background=4d63b8&color=ffffff"
        );
        User staff3 = seedCoreEmployeeIfAllowed(
            "grace.uwase",
            "Grace Uwase",
            "grace.uwase@ngabopharmacy.rw",
            "grace123",
            branch,
            "https://ui-avatars.com/api/?name=Grace+Uwase&background=3150ba&color=ffffff"
        );
        User staff4 = seedCoreEmployeeIfAllowed(
            "claude.irakoze",
            "Claude Irakoze",
            "claude.irakoze@ngabopharmacy.rw",
            "claude123",
            branch,
            "https://ui-avatars.com/api/?name=Claude+Irakoze&background=2747b3&color=ffffff"
        );
        User staff5 = seedCoreEmployeeIfAllowed(
            "pacifique.mugisha",
            "Pacifique Mugisha",
            "pacifique.mugisha@ngabopharmacy.rw",
            "pacifique123",
            branch,
            "https://ui-avatars.com/api/?name=Pacifique+Mugisha&background=1e40af&color=ffffff"
        );
        upsertProfile(manager, "MGR-001", "Shift Manager", "0788001101", LocalDate.of(2021, 3, 14), "0788001199");
        if (pharmacist != null) {
            upsertProfile(pharmacist, "EMP-101", "Pharmacist", "0788002201", LocalDate.of(2022, 5, 18), "0788002299");
        }
        if (staff1 != null) {
            upsertProfile(staff1, "EMP-102", "Pharmacy Assistant / Attendant", "0788002202", LocalDate.of(2023, 1, 9), "0788002298");
        }
        if (staff2 != null) {
            upsertProfile(staff2, "EMP-103", "Pharmacist", "0788002203", LocalDate.of(2022, 8, 2), "0788002297");
        }
        if (staff3 != null) {
            upsertProfile(staff3, "EMP-104", "Pharmacy Assistant / Attendant", "0788002204", LocalDate.of(2024, 2, 12), "0788002296");
        }
        if (staff4 != null) {
            upsertProfile(staff4, "EMP-105", "Pharmacist", "0788002205", LocalDate.of(2023, 11, 3), "0788002295");
        }
        if (staff5 != null) {
            upsertProfile(staff5, "EMP-106", "Pharmacy Assistant / Attendant", "0788002206", LocalDate.of(2023, 7, 20), "0788002294");
        }

        LocalDate weekStart = LocalDate.now().with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.MONDAY));
        resetSeededWeeklyAssignments(branch, weekStart);
        List<String> shiftNames = List.of("1st Shift", "2nd Shift");
        List<LocalTime> shiftStarts = List.of(LocalTime.of(7, 0), LocalTime.of(15, 0));
        List<LocalTime> shiftEnds = List.of(LocalTime.of(15, 0), LocalTime.of(23, 0));

        java.util.Map<String, Shift> seededShifts = new java.util.HashMap<>();
        for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
            LocalDate shiftDate = weekStart.plusDays(dayOffset);
            for (int shiftIndex = 0; shiftIndex < shiftNames.size(); shiftIndex++) {
                Shift shift = upsertShift(
                    branch,
                    shiftNames.get(shiftIndex),
                    shiftDate,
                    shiftStarts.get(shiftIndex),
                    shiftEnds.get(shiftIndex),
                    2,
                    0,
                    ShiftStatus.UNDERSTAFFED
                );
                seededShifts.put(shiftDate + "::" + shiftNames.get(shiftIndex), shift);
            }
        }

        Shift mondayFirst = seededShifts.get(weekStart + "::1st Shift");
        Shift mondaySecond = seededShifts.get(weekStart + "::2nd Shift");

        if (staff3 != null) {
            upsertAvailability(staff3, weekStart.plusDays(1), AvailabilityStatus.PREFERRED, LocalTime.of(15, 0), LocalTime.of(23, 0), "Available for late pharmacy assistant coverage.");
        }
        if (staff2 != null) {
            upsertAvailability(staff2, weekStart.plusDays(1), AvailabilityStatus.AVAILABLE, LocalTime.of(15, 0), LocalTime.of(23, 0), "Ready for late pharmacist coverage.");
        }
        if (staff5 != null) {
            upsertAvailability(staff5, weekStart.plusDays(2), AvailabilityStatus.UNAVAILABLE, null, null, "Off duty for personal leave.");
        }

        if (pharmacist != null) {
            upsertAdjustment(pharmacist, mondaySecond, "Shift Swap", "Swap the second shift with another pharmacist for the Tuesday second-shift rotation.", AdjustmentStatus.PENDING, null);
        }
        if (staff2 != null) {
            upsertAdjustment(staff2, seededShifts.get(weekStart.plusDays(1) + "::2nd Shift"), "Overtime Request", "Extend the late pharmacist coverage by one hour for stock receiving.", AdjustmentStatus.APPROVED, LocalDateTime.now().minusHours(6));
        }
        if (staff3 != null) {
            upsertAdjustment(staff3, mondayFirst, "Time Off Request", "Request leave from the first pharmacy assistant shift for a family commitment.", AdjustmentStatus.REJECTED, LocalDateTime.now().minusDays(1));
        }

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
            "Weekend coverage must preserve prescription dispensing and pharmacy assistant support at all times.",
            LocalDateTime.now().minusDays(1)
        );

        upsertNotification(manager, "Weekly schedule published", "The roster for " + weekStart + " is fully assigned across both daily shifts.", NotificationPriority.HIGH, false);
        upsertNotification(manager, "Shift swap request awaiting review", "Eric Ndayisaba submitted a live shift adjustment request for the second shift rota.", NotificationPriority.MEDIUM, false);
        upsertNotification(manager, "Compliance reminder", "Controlled medicines documentation is due before branch opening tomorrow.", NotificationPriority.LOW, true);
        if (pharmacist != null) {
            upsertNotification(pharmacist, "Upcoming 2nd Shift", "You are scheduled for 2nd Shift pharmacist coverage at 15:00.", NotificationPriority.MEDIUM, false);
        }

        upsertPolicy(branch, "Maximum Weekly Hours", "Staff may not exceed 48 total hours within a rolling 7-day period without branch manager approval.", "Scheduling", true);
        upsertPolicy(branch, "Mandatory Rest Period", "Maintain at least 11 continuous hours between closing and opening shifts for all pharmacy staff.", "Scheduling", true);
        upsertPolicy(branch, "Controlled Medicines Register", "Every controlled medicines movement must be recorded during the same service window.", "Compliance", true);

        if (pharmacist != null) {
            reseedMonthlyPayroll(pharmacist, List.of(
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(2), new BigDecimal("168.0"), new BigDecimal("10.0"), new BigDecimal("457500.00")),
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(1), new BigDecimal("160.0"), new BigDecimal("8.0"), new BigDecimal("430000.00")),
                new MonthlyPayrollSeed(YearMonth.now(), new BigDecimal("168.0"), new BigDecimal("12.0"), new BigDecimal("465000.00"))
            ));
        }
        if (staff1 != null) {
            reseedMonthlyPayroll(staff1, List.of(
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(2), new BigDecimal("160.0"), new BigDecimal("6.0"), new BigDecimal("382500.00")),
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(1), new BigDecimal("168.0"), new BigDecimal("4.0"), new BigDecimal("435000.00")),
                new MonthlyPayrollSeed(YearMonth.now(), new BigDecimal("160.0"), new BigDecimal("8.0"), new BigDecimal("430000.00"))
            ));
        }
        if (staff2 != null) {
            reseedMonthlyPayroll(staff2, List.of(
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(2), new BigDecimal("168.0"), new BigDecimal("8.0"), new BigDecimal("450000.00")),
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(1), new BigDecimal("160.0"), new BigDecimal("6.0"), new BigDecimal("422500.00")),
                new MonthlyPayrollSeed(YearMonth.now(), new BigDecimal("168.0"), new BigDecimal("10.0"), new BigDecimal("457500.00"))
            ));
        }
        if (staff3 != null) {
            reseedMonthlyPayroll(staff3, List.of(
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(2), new BigDecimal("160.0"), new BigDecimal("4.0"), new BigDecimal("415000.00")),
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(1), new BigDecimal("152.0"), new BigDecimal("6.0"), new BigDecimal("402500.00")),
                new MonthlyPayrollSeed(YearMonth.now(), new BigDecimal("160.0"), new BigDecimal("6.0"), new BigDecimal("422500.00"))
            ));
        }
        if (staff4 != null) {
            reseedMonthlyPayroll(staff4, List.of(
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(2), new BigDecimal("168.0"), new BigDecimal("12.0"), new BigDecimal("465000.00")),
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(1), new BigDecimal("160.0"), new BigDecimal("8.0"), new BigDecimal("430000.00")),
                new MonthlyPayrollSeed(YearMonth.now(), new BigDecimal("168.0"), new BigDecimal("8.0"), new BigDecimal("450000.00"))
            ));
        }
        if (staff5 != null) {
            reseedMonthlyPayroll(staff5, List.of(
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(2), new BigDecimal("152.0"), new BigDecimal("4.0"), new BigDecimal("395000.00")),
                new MonthlyPayrollSeed(YearMonth.now().minusMonths(1), new BigDecimal("160.0"), new BigDecimal("6.0"), new BigDecimal("422500.00")),
                new MonthlyPayrollSeed(YearMonth.now(), new BigDecimal("160.0"), new BigDecimal("4.0"), new BigDecimal("415000.00"))
            ));
        }

        upsertAuditLog(admin, "Updated pharmacy staffing policy", "Compliance", LocalDateTime.now().minusHours(9), "Reinforced handover coverage for controlled medicines at branch close.");
        upsertAuditLog(manager, "Approved overtime request", "Scheduling", LocalDateTime.now().minusHours(6), "Approved extended pharmacy coverage support for the second-shift rotation.");
        upsertAuditLog(manager, "Reviewed branch notification queue", "Notifications", LocalDateTime.now().minusHours(3), "Cleared one completed reminder and left urgent items active for follow-up.");
    }

    private Branch updateBranch(Branch branch, String name, String location) {
        branch.setName(name);
        branch.setLocation(location);
        branch.setType(BranchType.RETAIL_PHARMACY);
        branch.setActive(true);
        return branchRepository.save(branch);
    }

    private User seedCoreEmployeeIfAllowed(String username, String fullName, String email, String rawPassword, Branch branch, String profileImageUrl) {
        if (deletedSeedEmployeeRepository.existsByUsername(username)) {
            return null;
        }
        return upsertUser(username, fullName, email, rawPassword, Role.EMPLOYEE, branch, profileImageUrl);
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

    private void purgeExtraSeedEmployees(Branch branch) {
        List<User> extraSeedEmployees = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(user -> user.getBranch() != null && user.getBranch().getId().equals(branch.getId()))
            .filter(user -> !CORE_EMPLOYEE_USERNAMES.contains(user.getUsername()))
            .toList();

        if (extraSeedEmployees.isEmpty()) {
            recalculateBranchShiftCounts(branch);
            return;
        }

        Set<Long> removedUserIds = extraSeedEmployees.stream()
            .map(User::getId)
            .collect(java.util.stream.Collectors.toSet());

        employeeProfileRepository.deleteAll(
            employeeProfileRepository.findAll().stream()
                .filter(profile -> profile.getUser() != null && removedUserIds.contains(profile.getUser().getId()))
                .toList()
        );
        availabilityRepository.deleteAll(
            availabilityRepository.findAll().stream()
                .filter(item -> item.getEmployee() != null && removedUserIds.contains(item.getEmployee().getId()))
                .toList()
        );
        shiftAssignmentRepository.deleteAll(
            shiftAssignmentRepository.findAll().stream()
                .filter(item -> item.getEmployee() != null && removedUserIds.contains(item.getEmployee().getId()))
                .toList()
        );
        shiftAdjustmentRequestRepository.deleteAll(
            shiftAdjustmentRequestRepository.findAll().stream()
                .filter(item ->
                    (item.getEmployee() != null && removedUserIds.contains(item.getEmployee().getId())) ||
                    (item.getTargetEmployee() != null && removedUserIds.contains(item.getTargetEmployee().getId()))
                )
                .toList()
        );
        notificationRepository.deleteAll(
            notificationRepository.findAll().stream()
                .filter(item -> item.getRecipient() != null && removedUserIds.contains(item.getRecipient().getId()))
                .toList()
        );
        payrollRecordRepository.deleteAll(
            payrollRecordRepository.findAll().stream()
                .filter(item -> item.getEmployee() != null && removedUserIds.contains(item.getEmployee().getId()))
                .toList()
        );
        auditLogRepository.deleteAll(
            auditLogRepository.findAll().stream()
                .filter(item -> item.getActor() != null && removedUserIds.contains(item.getActor().getId()))
                .toList()
        );
        userRepository.deleteAll(extraSeedEmployees);
        recalculateBranchShiftCounts(branch);
    }

    private void recalculateBranchShiftCounts(Branch branch) {
        shiftRepository.findByBranchId(branch.getId()).forEach(shift -> {
            int assigned = shiftAssignmentRepository.findByShiftId(shift.getId()).size();
            shift.setAssignedStaff(assigned);
            shift.setStatus(assigned >= shift.getRequiredStaff()
                ? ShiftStatus.FULL
                : assigned > 0
                    ? ShiftStatus.PARTIALLY_STAFFED
                    : ShiftStatus.UNDERSTAFFED);
            shiftRepository.save(shift);
        });
    }

    private void resetSeededWeeklyAssignments(Branch branch, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<Shift> seededWeekShifts = shiftRepository.findByBranchId(branch.getId()).stream()
            .filter(shift -> shift.getName() != null && CANONICAL_SHIFT_NAMES.contains(shift.getName()))
            .filter(shift -> !shift.getShiftDate().isBefore(weekStart) && !shift.getShiftDate().isAfter(weekEnd))
            .toList();

        if (seededWeekShifts.isEmpty()) {
            return;
        }

        List<Long> seededShiftIds = seededWeekShifts.stream().map(Shift::getId).toList();
        shiftAdjustmentRequestRepository.deleteAll(
            shiftAdjustmentRequestRepository.findAll().stream()
                .filter(request -> request.getShift() != null && seededShiftIds.contains(request.getShift().getId()))
                .toList()
        );
        shiftAssignmentRepository.deleteAll(
            seededWeekShifts.stream()
                .flatMap(shift -> shiftAssignmentRepository.findByShiftId(shift.getId()).stream())
                .toList()
        );
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
        user.setMustChangePassword(false);
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
        profile.setNotifyScheduleChanges(true);
        profile.setNotifyCompanyNews(true);
        profile.setNotifyTeamMessages(true);
        profile.setHideProfile(false);
        profile.setQuietHoursEnabled(true);
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

    private void reseedMonthlyPayroll(User employee, List<MonthlyPayrollSeed> monthlySeeds) {
        payrollRecordRepository.deleteAll(
            payrollRecordRepository.findAll().stream()
                .filter(item -> item.getEmployee() != null && item.getEmployee().getId().equals(employee.getId()))
                .toList()
        );

        for (MonthlyPayrollSeed monthlySeed : monthlySeeds) {
            upsertPayroll(
                employee,
                monthlySeed.month().atDay(1),
                monthlySeed.month().atEndOfMonth(),
                monthlySeed.regularHours(),
                monthlySeed.overtimeHours(),
                monthlySeed.grossPay()
            );
        }
    }

    private record MonthlyPayrollSeed(
        YearMonth month,
        BigDecimal regularHours,
        BigDecimal overtimeHours,
        BigDecimal grossPay
    ) {
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
