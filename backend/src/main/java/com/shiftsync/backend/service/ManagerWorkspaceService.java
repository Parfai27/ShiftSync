package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ActivityItem;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.AdjustmentMetric;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.AdjustmentRequestCard;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.AdjustmentsSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ComplianceAlert;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ComplianceCheck;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ComplianceSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.DistributionItem;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.EmployeeDetail;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.FolderItem;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.LegendItem;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ManagerIdentity;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ManagerWorkspaceResponse;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.NotificationItem;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.NotificationSummary;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.NotificationsSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.PolicyCard;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ProfilesSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ReportMetric;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ReportRow;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ReportsSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.RosterItem;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ScheduleBlock;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ScheduleRow;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ScheduledRoleSlot;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SchedulingBoardDay;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SchedulingDay;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SchedulingOverviewCard;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SchedulingSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SchedulingStat;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SchedulingSuggestion;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.SettingsSection;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.ShiftLane;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.VisibilityRule;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.WeeklyScheduleBoard;
import com.shiftsync.backend.dto.ManagerWorkspaceDtos.WorkflowRule;
import com.shiftsync.backend.dto.ManagerActionDtos.AdjustmentDecisionRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.CompliancePolicyCreateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.CompliancePolicyStatusUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeCreateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeCreateResponse;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeArchiveRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeStatusUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.EmployeeUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.NotificationUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.SettingsUpdateRequest;
import com.shiftsync.backend.dto.ManagerActionDtos.TeamArchiveRequest;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.Branch;
import com.shiftsync.backend.model.CompliancePolicy;
import com.shiftsync.backend.model.EmployeeProfile;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.model.NotificationPriority;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.ShiftStatus;
import com.shiftsync.backend.model.SwapResponseStatus;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.CompliancePolicyRepository;
import com.shiftsync.backend.repository.EmployeeProfileRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManagerWorkspaceService {

    private static final DateTimeFormatter DATE_LABEL = DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.ENGLISH);
    private static final DateTimeFormatter SHORT_DATE = DateTimeFormatter.ofPattern("dd", Locale.ENGLISH);
    private static final DateTimeFormatter SHORT_DAY = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
    private static final DateTimeFormatter SHIFT_TIME = DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);
    private static final DateTimeFormatter AUDIT_TIME = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
    private static final List<String> REQUIRED_SHIFT_ROLES = List.of(
        "Pharmacist",
        "Pharmacy Assistant / Attendant"
    );
    private static final List<String> ALLOWED_EMPLOYEE_JOB_TITLES = List.of(
        "Pharmacist",
        "Pharmacy Assistant / Attendant"
    );
    private static final List<String> ALLOWED_POLICY_CATEGORIES = List.of(
        "Scheduling",
        "Compliance",
        "Operations"
    );
    private static final List<String> ALLOWED_SHIFT_SWAP_MODES = List.of(
        "Manual Review",
        "Manager Approval",
        "Auto Approve"
    );
    private static final List<String> ALLOWED_WORK_WEEK_START_DAYS = List.of(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    );
    private static final List<String> ALLOWED_CURRENCY_OPTIONS = List.of(
        "RWF - Rwanda",
        "USD - English",
        "EUR - English"
    );
    private static final List<String> CANONICAL_SHIFT_NAMES = List.of(
        "1st Shift",
        "2nd Shift"
    );

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final ShiftAdjustmentRequestRepository adjustmentRepository;
    private final NotificationRepository notificationRepository;
    private final CompliancePolicyRepository compliancePolicyRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final CredentialEmailService credentialEmailService;

    public ManagerWorkspaceResponse getWorkspace(Long userId, int rangeDays) {
        User manager = requireManager(userId);
        int safeRangeDays = Math.max(7, Math.min(rangeDays, 31));

        List<User> branchEmployees = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(user -> manager.getBranch() != null && user.getBranch() != null)
            .filter(user -> manager.getBranch().getId().equals(user.getBranch().getId()))
            .sorted(Comparator.comparing(User::getFullName))
            .toList();

        List<User> activeEmployees = branchEmployees.stream()
            .filter(User::isActive)
            .toList();

        List<Shift> branchShifts = shiftRepository.findByBranchId(manager.getBranch().getId()).stream()
            .sorted(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .toList();

        List<ShiftAssignment> assignments = branchShifts.stream()
            .flatMap(shift -> shiftAssignmentRepository.findByShiftId(shift.getId()).stream())
            .sorted(Comparator.comparing(item -> item.getShift().getShiftDate()))
            .toList();

        List<ShiftAdjustmentRequest> adjustments = adjustmentRepository.findAll().stream()
            .filter(item -> manager.getBranch().getId().equals(item.getEmployee().getBranch().getId()))
            .sorted(Comparator.comparing(ShiftAdjustmentRequest::getCreatedAt).reversed())
            .toList();

        List<Notification> managerNotifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(manager.getId());
        List<CompliancePolicy> policies = compliancePolicyRepository.findByBranchId(manager.getBranch().getId());
        List<AuditLog> auditLogs = auditLogRepository.findTop20ByOrderByActionTimeDesc();

        Map<Long, EmployeeProfile> profilesByUserId = new HashMap<>();
        for (User employee : branchEmployees) {
            employeeProfileRepository.findByUserId(employee.getId()).ifPresent(profile -> profilesByUserId.put(employee.getId(), profile));
        }

        return new ManagerWorkspaceResponse(
            buildIdentity(manager),
            buildProfilesSection(manager, branchEmployees, branchShifts, assignments, profilesByUserId),
            buildSchedulingSection(activeEmployees, branchShifts, assignments, adjustments, safeRangeDays),
            buildAdjustmentsSection(adjustments, auditLogs),
            buildNotificationsSection(managerNotifications, adjustments, policies),
            buildComplianceSection(branchShifts, policies, auditLogs),
            buildReportsSection(activeEmployees, branchShifts, assignments, profilesByUserId),
            buildSettingsSection(manager, policies)
        );
    }

    @Transactional
    public void decideAdjustment(Long adjustmentId, AdjustmentDecisionRequest request) {
        User manager = requireManager(request.managerId());

        ShiftAdjustmentRequest adjustment = adjustmentRepository.findById(adjustmentId)
            .orElseThrow(() -> new IllegalArgumentException("Adjustment not found"));

        if (!manager.getBranch().getId().equals(adjustment.getEmployee().getBranch().getId())) {
            throw new IllegalArgumentException("Adjustment does not belong to the manager pharmacy");
        }

        if (
            request.status() == AdjustmentStatus.APPROVED
            && "Shift Swap".equalsIgnoreCase(adjustment.getAdjustmentType())
            && adjustment.getTargetEmployeeResponse() != SwapResponseStatus.ACCEPTED
        ) {
            throw new IllegalArgumentException("Swap cannot be approved before the second employee accepts.");
        }

        adjustment.setStatus(request.status());
        adjustment.setReviewedAt(java.time.LocalDateTime.now());
        adjustmentRepository.save(adjustment);

        if (request.status() == AdjustmentStatus.APPROVED) {
            applyApprovedAdjustment(adjustment, manager);
        }

        String note = defaultString(request.note(), "No additional note recorded.");
        String action = request.status() == AdjustmentStatus.APPROVED ? "Approved shift adjustment" : "Rejected shift adjustment";
        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action(action)
                .targetModule("Scheduling")
                .actionTime(java.time.LocalDateTime.now())
                .details(action + " for " + adjustment.getEmployee().getFullName() + ". " + note)
                .build()
        );

        if (request.status() != AdjustmentStatus.APPROVED) {
            notificationRepository.save(
                Notification.builder()
                    .title("Adjustment " + request.status().name().toLowerCase(Locale.ENGLISH))
                    .message("Your " + adjustment.getAdjustmentType() + " request was " + request.status().name().toLowerCase(Locale.ENGLISH) + " by " + manager.getFullName() + ".")
                    .priority(NotificationPriority.HIGH)
                    .recipient(adjustment.getEmployee())
                    .read(false)
                    .build()
            );
        }
    }

    private void applyApprovedAdjustment(ShiftAdjustmentRequest adjustment, User manager) {
        if ("Time Off Request".equalsIgnoreCase(adjustment.getAdjustmentType())) {
            ShiftAssignment assigned = shiftAssignmentRepository.findByShiftId(adjustment.getShift().getId()).stream()
                .filter(item -> item.getEmployee().getId().equals(adjustment.getEmployee().getId()))
                .findFirst()
                .orElse(null);
            if (assigned != null) {
                shiftAssignmentRepository.delete(assigned);
                Shift shift = adjustment.getShift();
                shift.setAssignedStaff(Math.max(0, shift.getAssignedStaff() - 1));
                updateShiftStaffingStatus(shift);
                shiftRepository.save(shift);
                notificationRepository.save(
                    Notification.builder()
                        .title("Time off approved")
                        .message(buildTimeOffApprovedMessage(adjustment.getShift()))
                        .priority(NotificationPriority.MEDIUM)
                        .recipient(adjustment.getEmployee())
                        .read(false)
                        .build()
                );
                sendShiftChangeEmail(
                    adjustment.getEmployee(),
                    adjustment.getShift().getShiftDate(),
                    "Your shift time-off request was approved.",
                    "Your approved time-off request removed this shift from your schedule."
                );
            }
            return;
        }

        if (
            !"Shift Swap".equalsIgnoreCase(adjustment.getAdjustmentType()) ||
            adjustment.getTargetEmployee() == null ||
            adjustment.getTargetShift() == null
        ) {
            return;
        }

        ShiftAssignment currentAssignment = shiftAssignmentRepository.findByShiftId(adjustment.getShift().getId()).stream()
            .filter(item -> item.getEmployee().getId().equals(adjustment.getEmployee().getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Original employee is no longer assigned to this shift."));

        ShiftAssignment targetAssignment = shiftAssignmentRepository.findByShiftId(adjustment.getTargetShift().getId()).stream()
            .filter(item -> item.getEmployee().getId().equals(adjustment.getTargetEmployee().getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Target employee is no longer assigned to the requested swap shift."));

        if (!currentAssignment.getShift().getShiftDate().equals(targetAssignment.getShift().getShiftDate())) {
            throw new IllegalArgumentException("Shift swaps must happen between shifts on the same day.");
        }

        Shift requesterShiftBefore = currentAssignment.getShift();
        Shift targetShiftBefore = targetAssignment.getShift();
        String requesterRole = resolveShiftRole(adjustment.getEmployee());
        String targetRole = resolveShiftRole(adjustment.getTargetEmployee());
        if (requesterRole == null || targetRole == null || !requesterRole.equals(targetRole)) {
            throw new IllegalArgumentException("Only employees with the same role can swap shifts.");
        }

        currentAssignment.setEmployee(adjustment.getTargetEmployee());
        targetAssignment.setEmployee(adjustment.getEmployee());
        currentAssignment.setAssignedAt(java.time.LocalDateTime.now());
        targetAssignment.setAssignedAt(java.time.LocalDateTime.now());

        shiftAssignmentRepository.save(currentAssignment);
        shiftAssignmentRepository.save(targetAssignment);

        updateShiftStaffingStatus(adjustment.getShift());
        updateShiftStaffingStatus(adjustment.getTargetShift());
        shiftRepository.save(adjustment.getShift());
        shiftRepository.save(adjustment.getTargetShift());

        notificationRepository.save(
            Notification.builder()
                .title("Shift swap approved")
                .message(buildSwapApprovedMessage(
                    adjustment.getEmployee(),
                    requesterShiftBefore,
                    adjustment.getTargetShift()
                ))
                .priority(NotificationPriority.MEDIUM)
                .recipient(adjustment.getEmployee())
                .read(false)
                .build()
        );
        notificationRepository.save(
            Notification.builder()
                .title("Shift swap approved")
                .message(buildSwapApprovedMessage(
                    adjustment.getTargetEmployee(),
                    targetShiftBefore,
                    adjustment.getShift()
                ))
                .priority(NotificationPriority.MEDIUM)
                .recipient(adjustment.getTargetEmployee())
                .read(false)
                .build()
        );

        sendShiftChangeEmail(
            adjustment.getEmployee(),
            adjustment.getShift().getShiftDate(),
            "Your shift swap was approved.",
            buildSwapApprovedMessage(adjustment.getEmployee(), requesterShiftBefore, adjustment.getTargetShift())
        );
        sendShiftChangeEmail(
            adjustment.getTargetEmployee(),
            adjustment.getTargetShift().getShiftDate(),
            "Your shift swap was approved.",
            buildSwapApprovedMessage(adjustment.getTargetEmployee(), targetShiftBefore, adjustment.getShift())
        );
    }

    private void sendShiftChangeEmail(User employee, LocalDate referenceDate, String subject, String summaryLine) {
        if (employee == null || employee.getEmail() == null || employee.getEmail().isBlank()) {
            return;
        }

        LocalDate weekStart = referenceDate.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        List<ShiftAssignment> weeklyAssignments = shiftAssignmentRepository.findByEmployeeId(employee.getId()).stream()
            .filter(item -> item.getShift() != null)
            .filter(item -> !item.getShift().getShiftDate().isBefore(weekStart) && !item.getShift().getShiftDate().isAfter(weekEnd))
            .sorted(Comparator.comparing((ShiftAssignment item) -> item.getShift().getShiftDate()).thenComparing(item -> item.getShift().getStartTime()))
            .toList();

        boolean sent = credentialEmailService.sendShiftChangeNotice(
            employee.getEmail(),
            employee.getFullName(),
            subject,
            summaryLine,
            weeklyAssignments
        );

        if (sent) {
            return;
        }
    }

    private String buildTimeOffApprovedMessage(Shift shift) {
        return "Your time off was approved for " + shift.getName()
            + " on " + shift.getShiftDate()
            + " (" + formatShiftWindow(shift) + ").";
    }

    private String buildSwapApprovedMessage(User employee, Shift beforeShift, Shift afterShift) {
        String employeeName = employee != null ? employee.getFullName() : "The employee";
        return employeeName + " was moved from "
            + beforeShift.getName()
            + " on " + beforeShift.getShiftDate()
            + " (" + formatShiftWindow(beforeShift) + ") to "
            + afterShift.getName()
            + " on " + afterShift.getShiftDate()
            + " (" + formatShiftWindow(afterShift) + ").";
    }

    @Transactional
    public void updateNotification(Long managerId, Long notificationId, NotificationUpdateRequest request) {
        User manager = requireManager(managerId);

        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getRecipient().getId().equals(manager.getId())) {
            throw new IllegalArgumentException("Notification does not belong to this manager");
        }

        notification.setRead(request.read());
        notificationRepository.save(notification);

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action(request.read() ? "Marked notification as read" : "Reopened notification")
                .targetModule("Notifications")
                .actionTime(java.time.LocalDateTime.now())
                .details(notification.getTitle())
                .build()
        );
    }

    @Transactional
    public void markAllNotificationsRead(Long managerId) {
        User manager = requireManager(managerId);

        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(managerId);
        notifications.forEach(item -> item.setRead(true));
        notificationRepository.saveAll(notifications);

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action("Marked all notifications as read")
                .targetModule("Notifications")
                .actionTime(java.time.LocalDateTime.now())
                .details("Manager queue reset for " + manager.getFullName())
                .build()
        );
    }

    public EmployeeDetail getEmployeeDetail(Long managerId, Long employeeId) {
        User manager = requireManager(managerId);
        User employee = requireBranchEmployee(manager, employeeId);
        Map<Long, EmployeeProfile> profilesByUserId = new HashMap<>();
        employeeProfileRepository.findByUserId(employee.getId()).ifPresent(profile -> profilesByUserId.put(employee.getId(), profile));

        List<Shift> branchShifts = shiftRepository.findByBranchId(manager.getBranch().getId());
        List<ShiftAssignment> assignments = branchShifts.stream()
            .flatMap(shift -> shiftAssignmentRepository.findByShiftId(shift.getId()).stream())
            .filter(item -> item.getEmployee().getId().equals(employee.getId()))
            .toList();

        return buildEmployeeDetail(manager, employee, assignments, profilesByUserId.get(employee.getId()));
    }

    @Transactional
    public void updateEmployee(Long employeeId, EmployeeUpdateRequest request) {
        User manager = requireManager(request.managerId());
        User employee = requireManagedEmployee(manager, employeeId);
        String normalizedName = normalizeRequiredText(request.fullName(), "Employee full name is required.");
        String normalizedEmail = normalizeRequiredText(request.email(), "Employee email is required.").toLowerCase(Locale.ENGLISH);
        String normalizedJobTitle = normalizeJobTitle(request.jobTitle());
        validatePhoneNumber(request.phoneNumber());

        userRepository.findByEmail(normalizedEmail)
            .filter(existing -> !existing.getId().equals(employee.getId()))
            .ifPresent(existing -> {
                throw new IllegalArgumentException("That email address is already assigned to another user");
            });

        EmployeeProfile profile = employeeProfileRepository.findByUserId(employee.getId())
            .orElseGet(() -> EmployeeProfile.builder()
                .user(employee)
                .employeeCode("EMP-" + employee.getId())
                .build());

        employee.setFullName(normalizedName);
        employee.setEmail(normalizedEmail);
        profile.setJobTitle(normalizedJobTitle);
        profile.setPhoneNumber(defaultString(request.phoneNumber(), "").trim());

        userRepository.save(employee);
        employeeProfileRepository.save(profile);

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action("Updated employee profile")
                .targetModule("Profiles")
                .actionTime(java.time.LocalDateTime.now())
                .details("Updated profile details for " + employee.getFullName())
                .build()
        );
    }

    @Transactional
    public void archiveEmployee(Long employeeId, EmployeeArchiveRequest request) {
        updateEmployeeStatus(employeeId, new EmployeeStatusUpdateRequest(request.managerId(), false));
    }

    @Transactional
    public void updateEmployeeStatus(Long employeeId, EmployeeStatusUpdateRequest request) {
        User manager = requireManager(request.managerId());
        User employee = requireBranchEmployee(manager, employeeId);

        if (employee.isActive() == request.active()) {
            return;
        }

        employee.setActive(request.active());
        userRepository.save(employee);

        if (!request.active()) {
            releaseFutureShiftAssignments(employee);
            notificationRepository.save(
                Notification.builder()
                    .title("Account deactivated")
                    .message("Your ShiftSync account was deactivated by " + manager.getFullName() + ". Contact your manager if you believe this is a mistake.")
                    .priority(NotificationPriority.HIGH)
                    .recipient(employee)
                    .read(false)
                    .build()
            );
        } else {
            notificationRepository.save(
                Notification.builder()
                    .title("Account reactivated")
                    .message("Your ShiftSync account was reactivated by " + manager.getFullName() + ". You can sign in again with your existing credentials.")
                    .priority(NotificationPriority.MEDIUM)
                    .recipient(employee)
                    .read(false)
                    .build()
            );
        }

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action(request.active() ? "Reactivated employee account" : "Deactivated employee account")
                .targetModule("Profiles")
                .actionTime(java.time.LocalDateTime.now())
                .details((request.active() ? "Reactivated " : "Deactivated ") + employee.getFullName() + " (" + employee.getEmail() + ")")
                .build()
        );
    }

    @Transactional
    public EmployeeCreateResponse createEmployee(EmployeeCreateRequest request) {
        User manager = requireManager(request.managerId());
        String fullName = normalizeRequiredText(request.fullName(), "Employee full name is required.");
        String email = normalizeRequiredText(request.email(), "Employee email is required.").toLowerCase(Locale.ENGLISH);
        String normalizedJobTitle = normalizeJobTitle(request.jobTitle());
        validatePhoneNumber(request.phoneNumber());

        userRepository.findByEmail(email)
            .ifPresent(existing -> {
                throw new IllegalArgumentException("That email address is already assigned to another user");
            });

        String temporaryPassword = generateTemporaryPassword();

        User employee = User.builder()
            .fullName(fullName)
            .username(generateUsername(email, fullName))
            .email(email)
            .passwordHash(passwordEncoder.encode(temporaryPassword))
            .role(Role.EMPLOYEE)
            .branch(manager.getBranch())
            .active(true)
            .mustChangePassword(true)
            .profileImageUrl("https://ui-avatars.com/api/?name=" + fullName.trim().replace(" ", "+") + "&background=0f51ff&color=ffffff")
            .build();

        employee = userRepository.save(employee);

        EmployeeProfile profile = EmployeeProfile.builder()
            .user(employee)
            .employeeCode(generateEmployeeCode())
            .jobTitle(normalizedJobTitle)
            .phoneNumber(normalizeOptional(request.phoneNumber()))
            .hireDate(request.hireDate() != null ? request.hireDate() : LocalDate.now())
            .hourlyRate(null)
            .emergencyContactName(null)
            .emergencyContactPhone(null)
            .build();

        profile = employeeProfileRepository.save(profile);

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action("Created employee account")
                .targetModule("Profiles")
                .actionTime(java.time.LocalDateTime.now())
                .details("Created login-ready employee account for " + employee.getFullName())
                .build()
        );

        notificationRepository.save(
            Notification.builder()
                .title("New employee profile created")
                .message(employee.getFullName() + " was added to the active pharmacy team with login access.")
                .priority(NotificationPriority.MEDIUM)
                .recipient(manager)
                .read(false)
                .build()
        );

        boolean emailDelivered = credentialEmailService.sendNewEmployeeCredentials(
            employee.getEmail(),
            employee.getFullName(),
            temporaryPassword
        );

        return new EmployeeCreateResponse(
            employee.getId(),
            employee.getFullName(),
            employee.getEmail(),
            profile.getEmployeeCode(),
            emailDelivered,
            emailDelivered ? null : temporaryPassword,
            emailDelivered
                ? "Employee account created and credentials emailed successfully"
                : "Employee account created, but credentials email could not be delivered"
        );
    }

    @Transactional
    public void createCompliancePolicy(CompliancePolicyCreateRequest request) {
        User manager = requireManager(request.managerId());
        String title = normalizeRequiredText(request.title(), "Policy title is required.");
        String description = normalizeRequiredText(request.description(), "Policy description is required.");
        String category = normalizeRequiredText(request.category(), "Policy category is required.");

        if (title.length() < 4) {
            throw new IllegalArgumentException("Policy title must be at least 4 characters long");
        }
        if (description.length() < 12) {
            throw new IllegalArgumentException("Policy description must be at least 12 characters long");
        }
        if (!ALLOWED_POLICY_CATEGORIES.contains(category)) {
            throw new IllegalArgumentException("Choose a valid policy category");
        }

        CompliancePolicy policy = CompliancePolicy.builder()
            .title(title)
            .description(description)
            .category(category)
            .active(request.active() == null || request.active())
            .branch(manager.getBranch())
            .build();

        compliancePolicyRepository.save(policy);
        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action("Created compliance policy")
                .targetModule("Compliance")
                .actionTime(java.time.LocalDateTime.now())
                .details(policy.getTitle())
                .build()
        );
    }

    @Transactional
    public void updateCompliancePolicyStatus(Long policyId, CompliancePolicyStatusUpdateRequest request) {
        User manager = requireManager(request.managerId());
        CompliancePolicy policy = compliancePolicyRepository.findById(policyId)
            .orElseThrow(() -> new IllegalArgumentException("Compliance policy not found"));

        if (!policy.getBranch().getId().equals(manager.getBranch().getId())) {
            throw new IllegalArgumentException("Policy does not belong to the manager pharmacy");
        }

        policy.setActive(request.active());
        compliancePolicyRepository.save(policy);
        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action(request.active() ? "Activated compliance policy" : "Paused compliance policy")
                .targetModule("Compliance")
                .actionTime(java.time.LocalDateTime.now())
                .details(policy.getTitle())
                .build()
        );
    }

    @Transactional
    public void updateSettings(SettingsUpdateRequest request) {
        User manager = requireManager(request.managerId());
        Branch pharmacy = manager.getBranch();
        String shiftSwapApprovalMode = normalizeRequiredText(request.shiftSwapApprovalMode(), "Shift swap approval mode is required.");
        String workWeekStartDay = normalizeRequiredText(request.workWeekStartDay(), "Work week start day is required.");
        String currencyLocalization = normalizeRequiredText(request.currencyLocalization(), "Currency and localization setting is required.");
        String departmentName = normalizeRequiredText(request.departmentName(), "Department focus is required.");

        if (!ALLOWED_SHIFT_SWAP_MODES.contains(shiftSwapApprovalMode)) {
            throw new IllegalArgumentException("Choose a valid shift swap approval mode");
        }
        if (!ALLOWED_WORK_WEEK_START_DAYS.contains(workWeekStartDay)) {
            throw new IllegalArgumentException("Choose a valid work week start day");
        }
        if (!ALLOWED_CURRENCY_OPTIONS.contains(currencyLocalization)) {
            throw new IllegalArgumentException("Choose a valid currency and localization option");
        }
        if (departmentName.length() < 3) {
            throw new IllegalArgumentException("Department focus must be at least 3 characters long");
        }
        if (request.overtimeThresholdHours() < 1 || request.overtimeThresholdHours() > 168) {
            throw new IllegalArgumentException("Overtime threshold must be between 1 and 168 hours");
        }

        pharmacy.setShowSalaries(request.showSalaries());
        pharmacy.setShowPhoneNumbers(request.showPhoneNumbers());
        pharmacy.setPublicProfiles(request.publicProfiles());
        pharmacy.setAutoSchedulingEnabled(request.autoSchedulingEnabled());
        pharmacy.setShiftSwapApprovalMode(shiftSwapApprovalMode);
        pharmacy.setWorkWeekStartDay(workWeekStartDay);
        pharmacy.setOvertimeThresholdHours(request.overtimeThresholdHours());
        pharmacy.setCurrencyLocalization(currencyLocalization);
        pharmacy.setDepartmentName(departmentName);
        branchRepository.save(pharmacy);

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action("Updated pharmacy settings")
                .targetModule("Settings")
                .actionTime(java.time.LocalDateTime.now())
                .details("Saved visibility, scheduling, and localization settings for " + pharmacy.getName())
                .build()
        );
    }

    @Transactional
    public void archiveTeam(TeamArchiveRequest request) {
        User manager = requireManager(request.managerId());
        List<User> employees = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(User::isActive)
            .filter(user -> user.getBranch() != null && manager.getBranch() != null)
            .filter(user -> user.getBranch().getId().equals(manager.getBranch().getId()))
            .toList();

        if (employees.isEmpty()) {
            throw new IllegalArgumentException("There are no active employees left to archive");
        }

        employees.forEach(employee -> employee.setActive(false));
        userRepository.saveAll(employees);

        auditLogRepository.save(
            AuditLog.builder()
                .actor(manager)
                .action("Archived pharmacy team")
                .targetModule("Settings")
                .actionTime(java.time.LocalDateTime.now())
                .details("Archived " + employees.size() + " employee account(s) from the active pharmacy team")
                .build()
        );

        notificationRepository.save(
            Notification.builder()
                .title("Team archive completed")
                .message("All active employee accounts were archived from the pharmacy team.")
                .priority(NotificationPriority.HIGH)
                .recipient(manager)
                .read(false)
                .build()
        );
    }

    private ManagerIdentity buildIdentity(User manager) {
        return new ManagerIdentity(
            manager.getId(),
            manager.getFullName(),
            "Shift Manager",
            manager.getBranch().getName(),
            manager.getProfileImageUrl()
        );
    }

    private ProfilesSection buildProfilesSection(
        User manager,
        List<User> employees,
        List<Shift> shifts,
        List<ShiftAssignment> assignments,
        Map<Long, EmployeeProfile> profilesByUserId
    ) {
        List<RosterItem> roster = employees.stream()
            .map(employee -> {
                EmployeeProfile profile = profilesByUserId.get(employee.getId());
                Shift assignedShift = assignments.stream()
                    .filter(item -> item.getEmployee().getId().equals(employee.getId()))
                    .map(ShiftAssignment::getShift)
                    .filter(shift -> !shift.getShiftDate().isBefore(LocalDate.now()))
                    .min(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
                    .orElse(null);

                if (!employee.isActive()) {
                    return new RosterItem(
                        employee.getId(),
                        employee.getFullName(),
                        profile != null ? profile.getJobTitle() : "Pharmacy Staff",
                        resolveDepartment(profile),
                        "INACTIVE",
                        "---",
                        initials(employee.getFullName()),
                        "bg-rose-50 text-rose-700",
                        false
                    );
                }

                String status = assignedShift == null ? "OFF-DUTY" : assignedShift.getStatus() == ShiftStatus.FULL ? "SCHEDULED" : "REVIEW";
                String tone = "OFF-DUTY".equals(status) ? "bg-slate-100 text-slate-600" : "REVIEW".equals(status) ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";

                return new RosterItem(
                    employee.getId(),
                    employee.getFullName(),
                    profile != null ? profile.getJobTitle() : "Pharmacy Staff",
                    resolveDepartment(profile),
                    status,
                    assignedShift == null ? "---" : formatShiftWindow(assignedShift),
                    initials(employee.getFullName()),
                    tone,
                    true
                );
            })
            .toList();

        User featuredEmployee = employees.stream()
            .filter(User::isActive)
            .findFirst()
            .or(() -> employees.stream().findFirst())
            .orElse(null);
        long activeCount = employees.stream().filter(User::isActive).count();
        long inactiveCount = employees.size() - activeCount;

        EmployeeDetail detail = featuredEmployee == null
            ? null
            : buildEmployeeDetail(
                manager,
                featuredEmployee,
                assignments.stream().filter(item -> item.getEmployee().getId().equals(featuredEmployee.getId())).toList(),
                profilesByUserId.get(featuredEmployee.getId())
            );

        String summary = inactiveCount == 0
            ? "Manage " + activeCount + " active pharmacy team members at " + manager.getBranch().getName() + "."
            : "Manage " + activeCount + " active and " + inactiveCount + " inactive team members at " + manager.getBranch().getName() + ".";

        return new ProfilesSection(
            summary,
            "Showing 1-" + employees.size() + " of " + employees.size() + " employees",
            roster,
            detail
        );
    }

    private SchedulingSection buildSchedulingSection(List<User> employees, List<Shift> shifts, List<ShiftAssignment> assignments, List<ShiftAdjustmentRequest> adjustments, int rangeDays) {
        List<Shift> canonicalShifts = shifts.stream()
            .filter(this::isCanonicalShift)
            .sorted(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .toList();

        LocalDate today = LocalDate.now();
        LocalDate rangeStart = canonicalShifts.stream()
            .map(Shift::getShiftDate)
            .filter(date -> !date.isBefore(today))
            .min(LocalDate::compareTo)
            .orElse(today);
        LocalDate rangeEnd = rangeStart.plusDays(Math.max(0, rangeDays - 1L));

        List<Shift> nextWeekShifts = canonicalShifts.stream()
            .filter(shift -> !shift.getShiftDate().isBefore(rangeStart))
            .filter(shift -> !shift.getShiftDate().isAfter(rangeEnd))
            .toList();

        List<ShiftAdjustmentRequest> previewSwaps = adjustments == null ? List.of() : adjustments.stream()
            .filter(item -> "Shift Swap".equalsIgnoreCase(item.getAdjustmentType()))
            .filter(item -> item.getStatus() == AdjustmentStatus.PENDING)
            .filter(item -> item.getTargetEmployeeResponse() == SwapResponseStatus.ACCEPTED)
            .filter(item -> item.getTargetEmployee() != null && item.getTargetShift() != null)
            .toList();

        int totalHours = nextWeekShifts.stream()
            .mapToInt(shift -> shiftDurationHours(shift) * shift.getAssignedStaff())
            .sum();
        long openShifts = nextWeekShifts.stream().filter(shift -> shift.getAssignedStaff() < shift.getRequiredStaff()).count();
        int requiredStaff = nextWeekShifts.stream().mapToInt(Shift::getRequiredStaff).sum();
        int assignedStaff = nextWeekShifts.stream().mapToInt(Shift::getAssignedStaff).sum();
        int coverage = requiredStaff == 0 ? 0 : (int) Math.round((assignedStaff * 100.0) / requiredStaff);

        List<SchedulingStat> stats = List.of(
            new SchedulingStat("Total Hours", String.valueOf(totalHours), "Scheduled coverage hours"),
            new SchedulingStat("Open Shifts", String.format("%02d", openShifts), openShifts > 0 ? "Needs action" : "Covered"),
            new SchedulingStat("Coverage Score", coverage + "%", coverage >= 90 ? "Stable" : "Watch"),
            new SchedulingStat("Weekly Roles", String.valueOf(requiredStaff), "Required role placements")
        );

        List<SchedulingDay> days = nextWeekShifts.stream()
            .collect(java.util.stream.Collectors.groupingBy(Shift::getShiftDate, java.util.TreeMap::new, java.util.stream.Collectors.toList()))
            .entrySet().stream()
            .map(entry -> new SchedulingDay(
                entry.getKey().format(SHORT_DAY),
                entry.getKey().format(SHORT_DATE),
                buildCoverageAlertForDay(entry.getKey(), assignments)
            ))
            .toList();

        WeeklyScheduleBoard weeklyBoard = new WeeklyScheduleBoard(
            rangeStart.format(DATE_LABEL) + " - " + rangeEnd.format(DATE_LABEL),
            nextWeekShifts.stream()
                .map(Shift::getShiftDate)
                .distinct()
                .sorted()
                .map(date -> {
                    List<ShiftLane> dayLanes = nextWeekShifts.stream()
                        .filter(shift -> shift.getShiftDate().equals(date))
                        .sorted(Comparator.comparing(Shift::getStartTime))
                        .map(shift -> {
                            List<ShiftAssignment> shiftAssignments = assignments.stream()
                                .filter(item -> item.getShift().getId().equals(shift.getId()))
                                .toList();

                            Map<String, ShiftAssignment> assignmentByRole = new HashMap<>();
                            for (ShiftAssignment assignment : shiftAssignments) {
                                String role = resolveShiftRole(assignment.getEmployee());
                                if (role != null && !assignmentByRole.containsKey(role)) {
                                    assignmentByRole.put(role, assignment);
                                }
                            }

                            List<ScheduledRoleSlot> roleSlots = REQUIRED_SHIFT_ROLES.stream()
                                .map(role -> {
                                    ShiftAssignment assignment = assignmentByRole.get(role);
                                    String employeeName = assignment != null ? assignment.getEmployee().getFullName() : null;
                                    String employeeAvatar = assignment != null ? initials(assignment.getEmployee().getFullName()) : roleInitials(role);
                                    String status = assignment != null ? "ASSIGNED" : "OPEN";

                                    for (ShiftAdjustmentRequest preview : previewSwaps) {
                                        boolean requesterShiftMatch = preview.getShift().getId().equals(shift.getId())
                                            && assignment != null
                                            && assignment.getEmployee().getId().equals(preview.getEmployee().getId());
                                        boolean targetShiftMatch = preview.getTargetShift().getId().equals(shift.getId())
                                            && assignment != null
                                            && assignment.getEmployee().getId().equals(preview.getTargetEmployee().getId());

                                        if (requesterShiftMatch) {
                                            employeeName = preview.getTargetEmployee().getFullName();
                                            employeeAvatar = initials(employeeName);
                                            status = "PENDING_MANAGER";
                                            break;
                                        }
                                        if (targetShiftMatch) {
                                            employeeName = preview.getEmployee().getFullName();
                                            employeeAvatar = initials(employeeName);
                                            status = "PENDING_MANAGER";
                                            break;
                                        }
                                    }

                                    return new ScheduledRoleSlot(
                                        role,
                                        employeeName,
                                        employeeAvatar,
                                        status
                                    );
                                })
                                .toList();

                            long gapCount = roleSlots.stream().filter(slot -> "OPEN".equals(slot.status())).count();

                            return new ShiftLane(
                                shift.getName(),
                                formatShiftWindow(shift),
                                toneForShift(shift),
                                shift.getAssignedStaff(),
                                shift.getRequiredStaff(),
                                gapCount == 0 ? "Covered" : "Needs " + gapCount + " role" + (gapCount == 1 ? "" : "s"),
                                roleSlots
                            );
                        })
                        .toList();

                    return new SchedulingBoardDay(
                        date.format(SHORT_DAY),
                        date.format(SHORT_DATE),
                        date.format(DATE_LABEL),
                        date.toString(),
                        dayLanes.stream().anyMatch(lane -> lane.assignedStaff() < lane.requiredStaff()),
                        dayLanes
                    );
                })
                .toList()
        );

        List<ScheduleRow> rows = employees.stream()
            .map(employee -> {
                List<List<ScheduleBlock>> blocks = new ArrayList<>();
                List<Shift> employeeShifts = assignments.stream()
                    .filter(item -> item.getEmployee().getId().equals(employee.getId()))
                    .map(ShiftAssignment::getShift)
                    .toList();

                for (Shift scheduledShift : nextWeekShifts) {
                    List<ScheduleBlock> shiftBlocks = employeeShifts.stream()
                        .filter(shift -> shift.getId().equals(scheduledShift.getId()))
                        .map(shift -> new ScheduleBlock(
                            shift.getName() + " • " + formatShiftWindow(shift),
                            switch (toneForShift(shift)) {
                                case "slate" -> "bg-slate-100 border-slate-500 text-slate-700";
                                case "blue" -> "bg-blue-100 border-blue-500 text-blue-700";
                                default -> "bg-indigo-100 border-indigo-500 text-indigo-700";
                            }
                        ))
                        .toList();
                    blocks.add(shiftBlocks);
                }

                long hours = employeeShifts.stream()
                    .mapToLong(this::shiftDurationHours)
                    .sum();

                EmployeeProfile profile = employeeProfileRepository.findByUserId(employee.getId()).orElse(null);

                return new ScheduleRow(
                    employee.getFullName(),
                    profile != null ? profile.getJobTitle() : "Pharmacy Staff",
                    hours + "h / 40h",
                    initials(employee.getFullName()),
                    false,
                    blocks
                );
            })
            .toList();

        List<LegendItem> legend = List.of(
            new LegendItem("1st Shift", "bg-blue-600"),
            new LegendItem("2nd Shift", "bg-indigo-500"),
            new LegendItem("Coverage Gap", "bg-red-500")
        );

        Shift busiestShift = nextWeekShifts.stream()
            .max(Comparator.comparing(Shift::getAssignedStaff))
            .orElse(null);
        List<String> dailyCoverageAlerts = nextWeekShifts.stream()
            .map(Shift::getShiftDate)
            .distinct()
            .sorted()
            .map(date -> buildCoverageAlertForDay(date, assignments))
            .filter(alert -> alert != null && !alert.isBlank())
            .toList();

        return new SchedulingSection(
            "Managing " + (nextWeekShifts.isEmpty() ? "the upcoming rota" : rangeStart.format(DATE_LABEL) + " to " + rangeEnd.format(DATE_LABEL)) + " for continuous pharmacy coverage.",
            stats,
            days,
            rows,
            weeklyBoard,
            legend,
            new SchedulingOverviewCard(
                "Schedule Overview",
                "Weekly two-shift staffing snapshot",
                busiestShift == null ? "No shifts yet" : busiestShift.getName() + " • " + formatShiftWindow(busiestShift),
                employees.size() + " pharmacy staff active",
                dailyCoverageAlerts.isEmpty()
                    ? "All visible days have both required roles covered"
                    : dailyCoverageAlerts.getFirst()
            ),
            new SchedulingSuggestion(
                "Auto Suggest",
                "Balance role coverage across the weekly rota",
                openShifts > 0
                    ? "Fill the earliest open role on the weekly rota to keep both the pharmacist and assistant present every day."
                    : "Coverage is healthy. Keep the current weekly rotation and watch fatigue across both shifts.",
                "Assign Available Staff"
            )
        );
    }

    private AdjustmentsSection buildAdjustmentsSection(List<ShiftAdjustmentRequest> adjustments, List<AuditLog> auditLogs) {
        List<AdjustmentRequestCard> requests = adjustments.stream()
            .map(request -> new AdjustmentRequestCard(
                request.getId(),
                request.getEmployee().getFullName(),
                request.getAdjustmentType() + " • " + request.getCreatedAt().format(DATE_LABEL),
                request.getShift().getShiftDate().toString(),
                request.getShift().getName(),
                formatShiftWindow(request.getShift()),
                request.getShift().getName(),
                request.getShift().getShiftDate().format(DATE_LABEL) + " • " + formatShiftWindow(request.getShift()),
                request.getTargetEmployee() == null
                    ? (request.getStatus() == AdjustmentStatus.PENDING ? "Awaiting manager decision" : "Manager decision recorded")
                    : "Swap with " + request.getTargetEmployee().getFullName(),
                request.getTargetShift() != null
                    ? request.getTargetShift().getName() + " â€¢ " + request.getTargetShift().getShiftDate().format(DATE_LABEL) + " â€¢ " + formatShiftWindow(request.getTargetShift())
                    : request.getRequestedChange()
                        + (
                            request.getTargetEmployeeResponse() != null
                                ? " | Peer response: " + request.getTargetEmployeeResponse().name()
                                : ""
                        ),
                request.getTargetEmployeeResponse() != null ? request.getTargetEmployeeResponse().name() : "NOT_REQUIRED",
                request.getRequestedChange(),
                request.getStatus().name()
            ))
            .toList();

        long pending = adjustments.stream().filter(item -> item.getStatus() == AdjustmentStatus.PENDING).count();
        long approved = adjustments.stream().filter(item -> item.getStatus() == AdjustmentStatus.APPROVED).count();

        List<ActivityItem> recentActivity = auditLogs.stream()
            .filter(log -> "Scheduling".equalsIgnoreCase(log.getTargetModule()) || "Compliance".equalsIgnoreCase(log.getTargetModule()))
            .limit(3)
            .map(log -> new ActivityItem(
                log.getAction(),
                log.getDetails(),
                "Scheduling".equalsIgnoreCase(log.getTargetModule()) ? "bg-blue-600" : "bg-orange-600",
                log.getActionTime().format(AUDIT_TIME),
                "Review Event",
                null
            ))
            .toList();

        return new AdjustmentsSection(
            "Review live shift change requests coming from Ngabo Pharmacy staff and keep coverage safe.",
            requests,
            List.of(
                new ComplianceCheck("Rest Periods", "All open requests are checked against pharmacy rest and handover rules.", "success"),
                new ComplianceCheck("Overtime Alert", pending > 0 ? pending + " request(s) need approval before weekly caps are breached." : "No overtime risks in the current queue.", pending > 0 ? "warning" : "success")
            ),
            List.of(
                new AdjustmentMetric("Wait Time", pending > 0 ? "2.1h" : "0.4h"),
                new AdjustmentMetric("Approval Rate", (approved + pending) == 0 ? "0%" : Math.round((approved * 100.0) / (approved + pending)) + "%")
            ),
            recentActivity
        );
    }

    private NotificationsSection buildNotificationsSection(List<Notification> notifications, List<ShiftAdjustmentRequest> adjustments, List<CompliancePolicy> policies) {
        List<NotificationItem> items = notifications.stream()
            .map(notification -> new NotificationItem(
                notification.getId(),
                resolveKind(notification),
                notification.getCreatedAt().format(AUDIT_TIME),
                notification.getTitle(),
                notification.getMessage(),
                notification.getPriority() == NotificationPriority.HIGH ? "Resolve Now" : "Open",
                notification.getPriority() == NotificationPriority.HIGH ? "Dismiss" : null,
                null,
                null,
                notification.getPriority() == NotificationPriority.LOW ? "View Details" : null,
                notification.isRead()
            ))
            .toList();

        List<NotificationItem> todayItems = items.stream().limit(2).toList();
        List<NotificationItem> earlierItems = items.stream().skip(2).toList();

        long unread = notifications.stream().filter(item -> !item.isRead()).count();
        long urgent = notifications.stream().filter(item -> item.getPriority() == NotificationPriority.HIGH && !item.isRead()).count();

        return new NotificationsSection(
            "Stay informed about staffing gaps, policy reminders, and pharmacy updates flowing through the live manager queue.",
            "Today",
            "Earlier",
            List.of(
                new FolderItem("All Inbox", String.valueOf(notifications.size()), true, null),
                new FolderItem("Urgent Alerts", String.valueOf(urgent), false, "text-rose-600"),
                new FolderItem("Reminders", String.valueOf(Math.max(1, policies.size())), false, null),
                new FolderItem("System Updates", String.valueOf(Math.max(1, adjustments.size())), false, null)
            ),
            List.of(
                new FolderItem("Compliance", "", false, "bg-blue-600"),
                new FolderItem("Payroll Issues", "", false, "bg-rose-600"),
                new FolderItem("Shift Swaps", "", false, "bg-orange-600")
            ),
            todayItems,
            earlierItems,
            new NotificationSummary(unread, urgent),
            "Keep shift changes under control.",
            "Clear urgent coverage issues first, then work through reminders and pharmacy updates before the next handover."
        );
    }

    private ComplianceSection buildComplianceSection(List<Shift> shifts, List<CompliancePolicy> policies, List<AuditLog> auditLogs) {
        long gaps = shifts.stream().filter(shift -> shift.getAssignedStaff() < shift.getRequiredStaff()).count();
        String complianceRate = gaps == 0 ? "100%" : Math.max(84, 100 - (int) gaps * 4) + "%";

        List<PolicyCard> cards = policies.stream()
            .map(policy -> new PolicyCard(
                policy.getId(),
                policy.getTitle(),
                policy.getDescription(),
                policy.getCategory(),
                "bg-blue-50 text-blue-600",
                policy.isActive() ? "ACTIVE MONITORING" : "INACTIVE",
                policy.isActive(),
                "Pharmacy status",
                policy.isActive() ? "Enabled" : "Paused",
                "bg-[#0f51ff]",
                policy.isActive() ? "78%" : "22%",
                null
            ))
            .toList();

        List<ActivityItem> activity = auditLogs.stream()
            .filter(log -> "Compliance".equalsIgnoreCase(log.getTargetModule()) || "Scheduling".equalsIgnoreCase(log.getTargetModule()))
            .limit(10)
            .map(log -> new ActivityItem(
                log.getActionTime().format(AUDIT_TIME),
                log.getAction(),
                "Compliance".equalsIgnoreCase(log.getTargetModule()) ? "bg-rose-600" : "bg-slate-300",
                log.getActionTime().format(AUDIT_TIME),
                "View Change",
                "Compliance".equalsIgnoreCase(log.getTargetModule()) ? "Automated" : null
            ))
            .toList();

        return new ComplianceSection(
            "Monitor labor rules, pharmacy operations standards, and scheduling safeguards across the pharmacy.",
            new ComplianceAlert(
                gaps > 0 ? "Coverage alert at Ngabo Pharmacy" : "No critical violations detected",
                gaps > 0 ? gaps + " shift(s) are still below required staffing levels and should be addressed before the next service window." : "Current schedules meet the seeded staffing and policy thresholds.",
                gaps > 0 ? "Critical" : "Stable"
            ),
            String.valueOf(policies.size()),
            complianceRate,
            cards,
            activity
        );
    }

    private ReportsSection buildReportsSection(
        List<User> employees,
        List<Shift> shifts,
        List<ShiftAssignment> assignments,
        Map<Long, EmployeeProfile> profilesByUserId
    ) {
        List<Shift> reportShifts = shifts.stream()
            .filter(this::isCanonicalShift)
            .sorted(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .toList();

        int attendance = reportShifts.isEmpty() ? 0 : (int) Math.round(
            reportShifts.stream().mapToInt(Shift::getAssignedStaff).sum() * 100.0 /
                Math.max(1, reportShifts.stream().mapToInt(Shift::getRequiredStaff).sum())
        );
        int overtimeHours = (int) assignments.stream()
            .map(ShiftAssignment::getShift)
            .mapToLong(shift -> Math.max(0, shiftDurationHours(shift) - 8))
            .sum();
        int capacityPercent = Math.min(100, Math.max(35, attendance));

        LocalDate trendStart = reportShifts.stream()
            .map(Shift::getShiftDate)
            .filter(date -> !date.isBefore(LocalDate.now()))
            .min(LocalDate::compareTo)
            .orElse(LocalDate.now());

        List<Integer> attendanceBars = java.util.stream.IntStream.range(0, 7)
            .mapToObj(index -> {
                LocalDate targetDate = trendStart.plusDays(index);
                List<Shift> dayShifts = reportShifts.stream()
                    .filter(shift -> shift.getShiftDate().equals(targetDate))
                    .toList();
                int dayRequired = dayShifts.stream().mapToInt(Shift::getRequiredStaff).sum();
                int dayAssigned = dayShifts.stream().mapToInt(Shift::getAssignedStaff).sum();
                return dayRequired == 0 ? 0 : (int) Math.round((dayAssigned * 100.0) / dayRequired);
            })
            .toList();

        List<String> weekLabels = java.util.stream.IntStream.range(0, 7)
            .mapToObj(index -> trendStart.plusDays(index).format(SHORT_DAY))
            .toList();

        Map<String, Integer> departmentCounts = new HashMap<>();
        for (User employee : employees) {
            EmployeeProfile profile = profilesByUserId.get(employee.getId());
            departmentCounts.merge(resolveDepartment(profile), 1, Integer::sum);
        }

        List<DistributionItem> distribution = departmentCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(3)
            .map(entry -> new DistributionItem(
                entry.getKey(),
                entry.getValue(),
                entry.getKey().contains("Pharmacy") ? "bg-[#0f51ff]" : entry.getKey().contains("Inventory") ? "bg-[#5a6fc3]" : "bg-slate-300"
            ))
            .toList();

        List<ReportRow> recentCompliance = assignments.stream()
            .sorted(
                Comparator.comparing((ShiftAssignment item) -> item.getShift().getShiftDate()).reversed()
                    .thenComparing(item -> item.getShift().getStartTime(), Comparator.reverseOrder())
                    .thenComparing(ShiftAssignment::getAssignedAt, Comparator.nullsLast(Comparator.reverseOrder()))
            )
            .limit(20)
            .map(item -> {
                User employee = item.getEmployee();
                EmployeeProfile profile = profilesByUserId.get(employee.getId());
                Shift shift = item.getShift();
                boolean danger = shift.getAssignedStaff() < shift.getRequiredStaff();
                String status;
                if (danger) {
                    status = "Coverage Gap";
                } else if (shift.getShiftDate().isBefore(LocalDate.now())) {
                    status = "Completed";
                } else if (shift.getShiftDate().isEqual(LocalDate.now())) {
                    status = "Today";
                } else {
                    status = "Scheduled";
                }
                return new ReportRow(
                    initials(employee.getFullName()),
                    employee.getFullName(),
                    profile != null ? profile.getEmployeeCode() : "EMP-" + employee.getId(),
                    shift.getShiftDate().format(DATE_LABEL),
                    resolveDepartment(profile),
                    item.getClockedInAt() != null ? item.getClockedInAt().toLocalTime().format(SHIFT_TIME) : "--",
                    item.getClockedOutAt() != null ? item.getClockedOutAt().toLocalTime().format(SHIFT_TIME) : "--",
                    status,
                    danger
                );
            })
            .toList();

        return new ReportsSection(
            "Live pharmacy staffing analytics generated from current shifts, assignments, and policy-driven coverage metrics.",
            List.of(
                new ReportMetric("Total Active Employees", String.valueOf(employees.size()), "+4.0%", "bg-blue-50 text-blue-600"),
                new ReportMetric("Average Attendance", attendance + "%", attendance >= 90 ? "Stable" : "-2.0%", attendance >= 90 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"),
                new ReportMetric("Overtime Hours", overtimeHours + "h", overtimeHours > 0 ? "+1.8%" : "Stable", "bg-orange-50 text-orange-600")
            ),
            attendanceBars,
            weekLabels,
            capacityPercent,
            distribution,
            recentCompliance
        );
    }

    private SettingsSection buildSettingsSection(User manager, List<CompliancePolicy> policies) {
        Branch pharmacy = manager.getBranch();
        return new SettingsSection(
            "Configure pharmacy-wide visibility, workflow, and scheduling preferences for " + pharmacy.getName() + ".",
            List.of(
                new VisibilityRule("Show Salaries", "Only payroll-approved managers can view pay rates on shared schedules.", pharmacy.isShowSalaries()),
                new VisibilityRule("Phone Numbers", "Managers and licensed pharmacy staff can view verified emergency contacts.", pharmacy.isShowPhoneNumbers()),
                new VisibilityRule("Public Profiles", "Qualifications and service roles are visible across the pharmacy team.", pharmacy.isPublicProfiles())
            ),
            List.of(
                new WorkflowRule("Shift Swaps", pharmacy.getShiftSwapApprovalMode(), "Managers verify all peer-to-peer shift exchanges before approval.", "Configure Rules"),
                new WorkflowRule("Overtime Alerts", "Threshold: " + pharmacy.getOvertimeThresholdHours() + "h", "Receive immediate alerts when a staff member exceeds the weekly cap.", null),
                new WorkflowRule("Auto-Scheduling Trigger", pharmacy.isAutoSchedulingEnabled() ? "Enabled" : "Disabled", pharmacy.isAutoSchedulingEnabled() ? "Automatic schedule generation can be triggered from the manager queue." : "Managers will trigger scheduling manually until this is enabled.", pharmacy.isAutoSchedulingEnabled() ? "Disable Trigger" : "Enable Trigger")
            ),
            pharmacy.getDepartmentName(),
            pharmacy.getWorkWeekStartDay(),
            pharmacy.getOvertimeThresholdHours() + " Hours / Week",
            pharmacy.getCurrencyLocalization(),
            pharmacy.getName()
        );
    }

    private String buildCoverageAlertForDay(LocalDate date, List<ShiftAssignment> assignments) {
        List<String> coveredRoles = assignments.stream()
            .filter(item -> item.getShift().getShiftDate().equals(date))
            .map(ShiftAssignment::getEmployee)
            .map(this::resolveShiftRole)
            .filter(role -> role != null && !role.isBlank())
            .distinct()
            .toList();

        List<String> missingRoles = REQUIRED_SHIFT_ROLES.stream()
            .filter(role -> !coveredRoles.contains(role))
            .toList();

        if (missingRoles.isEmpty()) {
            return null;
        }

        return "Missing " + String.join(" and ", missingRoles);
    }

    private void updateShiftStaffingStatus(Shift shift) {
        if (shift.getAssignedStaff() <= 0) {
            shift.setStatus(ShiftStatus.UNDERSTAFFED);
            return;
        }
        if (shift.getAssignedStaff() < shift.getRequiredStaff()) {
            shift.setStatus(ShiftStatus.PARTIALLY_STAFFED);
            return;
        }
        shift.setStatus(ShiftStatus.FULL);
    }

    private String resolveDepartment(EmployeeProfile profile) {
        if (profile == null || profile.getJobTitle() == null) {
            return "Pharmacy Operations";
        }
        String role = profile.getJobTitle().toLowerCase(Locale.ENGLISH);
        if (role.contains("inventory")) {
            return "Inventory & Supply";
        }
        return "Pharmacy Operations";
    }

    private List<String> expertiseForRole(String jobTitle) {
        String role = jobTitle.toLowerCase(Locale.ENGLISH);
        if (role.contains("inventory")) {
            return List.of("Stock rotation", "Batch tracking", "Cold chain", "Supplier receiving");
        }
        if (role.contains("technician")) {
            return List.of("Prescription prep", "Dispensing support", "Claims handling", "Patient guidance");
        }
        return List.of("Dispensing", "Patient counselling", "Controlled drug logs", "Pharmacy operations");
    }

    private List<Boolean> weeklyAvailability(List<ShiftAssignment> assignments, Long employeeId) {
        LocalDate start = LocalDate.now().with(DayOfWeek.MONDAY);
        List<Boolean> values = new ArrayList<>();
        for (int index = 0; index < 7; index++) {
            LocalDate targetDate = start.plusDays(index);
            boolean available = assignments.stream()
                .filter(item -> item.getEmployee().getId().equals(employeeId))
                .anyMatch(item -> item.getShift().getShiftDate().equals(targetDate));
            values.add(available);
        }
        return values;
    }

    private String formatShiftWindow(Shift shift) {
        return shift.getStartTime().format(SHIFT_TIME) + " - " + shift.getEndTime().format(SHIFT_TIME);
    }

    private int shiftDurationHours(Shift shift) {
        int startHour = shift.getStartTime().getHour();
        int endHour = shift.getEndTime().getHour();
        int duration = endHour - startHour;
        return duration > 0 ? duration : duration + 24;
    }

    private boolean isCanonicalShift(Shift shift) {
        return shift.getName() != null && CANONICAL_SHIFT_NAMES.contains(shift.getName());
    }

    private String toneForShift(Shift shift) {
        String name = shift.getName() == null ? "" : shift.getName().toLowerCase(Locale.ENGLISH);
        if (name.contains("evening")) {
            return "slate";
        }
        if (name.contains("1st")) {
            return "blue";
        }
        return "indigo";
    }

    private String resolveShiftRole(User employee) {
        EmployeeProfile profile = employeeProfileRepository.findByUserId(employee.getId()).orElse(null);
        if (profile == null || profile.getJobTitle() == null) {
            return null;
        }

        String normalized = profile.getJobTitle().trim().toLowerCase(Locale.ENGLISH);
        if (normalized.contains("pharmacist")) {
            return "Pharmacist";
        }
        if (normalized.contains("assistant") || normalized.contains("attendant") || normalized.contains("technician")) {
            return "Pharmacy Assistant / Attendant";
        }
        return null;
    }

    private String roleInitials(String role) {
        return switch (role) {
            case "Pharmacist" -> "PH";
            case "Pharmacy Assistant / Attendant" -> "PA";
            default -> role.substring(0, Math.min(2, role.length())).toUpperCase(Locale.ENGLISH);
        };
    }

    private String resolveKind(Notification notification) {
        if (notification.getPriority() == NotificationPriority.HIGH) {
            return "urgent";
        }
        if (notification.getTitle().toLowerCase(Locale.ENGLISH).contains("swap")) {
            return "swap";
        }
        return "info";
    }

    private String initials(String name) {
        return name.split(" ").length > 1
            ? (name.split(" ")[0].substring(0, 1) + name.split(" ")[1].substring(0, 1)).toUpperCase(Locale.ENGLISH)
            : name.substring(0, Math.min(2, name.length())).toUpperCase(Locale.ENGLISH);
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String normalizeRequiredText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeJobTitle(String jobTitle) {
        String normalized = normalizeRequiredText(jobTitle, "Employee job title is required.");
        if (!ALLOWED_EMPLOYEE_JOB_TITLES.contains(normalized)) {
            throw new IllegalArgumentException("Employee role must be either Pharmacist or Pharmacy Assistant / Attendant");
        }
        return normalized;
    }

    private void validatePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return;
        }
        String normalized = phoneNumber.trim();
        if (!normalized.matches("^\\+?[0-9]{10,15}$")) {
            throw new IllegalArgumentException("Phone number must contain 10 to 15 digits");
        }
    }

    private String generateUsername(String email, String fullName) {
        String base = (email.contains("@") ? email.substring(0, email.indexOf('@')) : fullName)
            .toLowerCase(Locale.ENGLISH)
            .replaceAll("[^a-z0-9.]", ".");
        String candidate = base.replaceAll("\\.+", ".").replaceAll("^\\.|\\.$", "");
        if (candidate.isBlank()) {
            candidate = "employee";
        }

        String uniqueCandidate = candidate;
        int suffix = 1;
        while (userRepository.findByUsername(uniqueCandidate).isPresent()) {
            uniqueCandidate = candidate + suffix;
            suffix++;
        }
        return uniqueCandidate;
    }

    private String generateEmployeeCode() {
        int next = employeeProfileRepository.findAll().stream()
            .map(EmployeeProfile::getEmployeeCode)
            .filter(code -> code != null && code.startsWith("EMP-"))
            .map(code -> code.substring(4))
            .filter(number -> number.matches("\\d+"))
            .mapToInt(Integer::parseInt)
            .max()
            .orElse(100) + 1;
        return "EMP-" + next;
    }

    private String generateTemporaryPassword() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder("Ngabo@");
        for (int index = 0; index < 6; index++) {
            password.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return password.toString();
    }

    private EmployeeDetail buildEmployeeDetail(
        User manager,
        User employee,
        List<ShiftAssignment> assignments,
        EmployeeProfile profile
    ) {
        long workloadHours = assignments.stream()
            .map(ShiftAssignment::getShift)
            .filter(shift -> !shift.getShiftDate().isBefore(LocalDate.now().with(DayOfWeek.MONDAY)))
            .mapToLong(this::shiftDurationHours)
            .sum();

        return new EmployeeDetail(
            employee.getId(),
            employee.getFullName(),
            profile != null ? profile.getJobTitle() : "Pharmacy Staff",
            profile != null ? profile.getEmployeeCode() : "N/A",
            initials(employee.getFullName()),
            employee.getEmail(),
            profile != null ? defaultString(profile.getPhoneNumber(), "Not on file") : "Not on file",
            profile != null && profile.getHireDate() != null ? profile.getHireDate().format(DATE_LABEL) : "Not recorded",
            manager.getBranch().getLocation(),
            workloadHours + "h / 40h weekly",
            expertiseForRole(profile != null ? profile.getJobTitle() : "Pharmacy Staff"),
            weeklyAvailability(assignments, employee.getId()),
            employee.isActive()
        );
    }

    private void releaseFutureShiftAssignments(User employee) {
        LocalDate today = LocalDate.now();
        List<ShiftAssignment> futureAssignments = shiftAssignmentRepository.findByEmployeeId(employee.getId()).stream()
            .filter(assignment -> !assignment.getShift().getShiftDate().isBefore(today))
            .toList();

        if (futureAssignments.isEmpty()) {
            return;
        }

        shiftAssignmentRepository.deleteAll(futureAssignments);
    }

    private User requireManager(Long managerId) {
        User manager = userRepository.findById(managerId)
            .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (manager.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Requested user is not a manager");
        }

        return manager;
    }

    private User requireBranchEmployee(User manager, Long employeeId) {
        User employee = userRepository.findById(employeeId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (
            manager.getBranch() == null ||
            employee.getBranch() == null ||
            !manager.getBranch().getId().equals(employee.getBranch().getId())
        ) {
            throw new IllegalArgumentException("Employee does not belong to the manager pharmacy");
        }

        return employee;
    }

    private User requireManagedEmployee(User manager, Long employeeId) {
        User employee = requireBranchEmployee(manager, employeeId);

        if (!employee.isActive()) {
            throw new IllegalArgumentException("Employee account is inactive. Reactivate the account before editing or scheduling.");
        }

        return employee;
    }
}
