package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentRequestPayload;
import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentStatusUpdate;
import com.shiftsync.backend.dto.SchedulingDtos.AvailabilityRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ManagerSchedulingActionRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ManualShiftAssignmentRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ReassignShiftAssignmentRequest;
import com.shiftsync.backend.dto.SchedulingDtos.RemoveShiftAssignmentRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ShiftRequest;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.Availability;
import com.shiftsync.backend.model.AvailabilityStatus;
import com.shiftsync.backend.model.Branch;
import com.shiftsync.backend.model.EmployeeProfile;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.model.NotificationPriority;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.model.ShiftStatus;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.AvailabilityRepository;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.EmployeeProfileRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private static final List<String> REQUIRED_SHIFT_ROLES = List.of(
        "Pharmacist",
        "Pharmacy Assistant / Attendant"
    );

    private final ShiftRepository shiftRepository;
    private final BranchRepository branchRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ShiftAdjustmentRequestRepository adjustmentRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final CredentialEmailService credentialEmailService;

    public List<Shift> getShifts() {
        return shiftRepository.findAll();
    }

    public Shift createShift(ShiftRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
            .orElseThrow(() -> new IllegalArgumentException("Branch not found"));

        Shift shift = Shift.builder()
            .name(request.name())
            .branch(branch)
            .shiftDate(request.shiftDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .requiredStaff(request.requiredStaff())
            .assignedStaff(0)
            .status(ShiftStatus.DRAFT)
            .build();

        return shiftRepository.save(shift);
    }

    public Availability createAvailability(AvailabilityRequest request) {
        User employee = userRepository.findById(request.employeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Availability availability = Availability.builder()
            .employee(employee)
            .availableDate(request.availableDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .status(request.status())
            .notes(request.notes())
            .build();

        return availabilityRepository.save(availability);
    }

    public ShiftAdjustmentRequest createAdjustment(AdjustmentRequestPayload request) {
        User employee = userRepository.findById(request.employeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        Shift shift = shiftRepository.findById(request.shiftId())
            .orElseThrow(() -> new IllegalArgumentException("Shift not found"));

        ShiftAdjustmentRequest adjustment = ShiftAdjustmentRequest.builder()
            .employee(employee)
            .shift(shift)
            .adjustmentType(request.adjustmentType())
            .requestedChange(request.requestedChange())
            .status(AdjustmentStatus.PENDING)
            .build();

        return adjustmentRepository.save(adjustment);
    }

    public List<ShiftAdjustmentRequest> getAdjustments() {
        return adjustmentRepository.findAll();
    }

    public ShiftAdjustmentRequest updateAdjustmentStatus(Long id, AdjustmentStatusUpdate request) {
        ShiftAdjustmentRequest adjustment = adjustmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Adjustment not found"));

        adjustment.setStatus(request.status());
        adjustment.setReviewedAt(LocalDateTime.now());
        return adjustmentRepository.save(adjustment);
    }

    @Transactional
    public Shift createManagerShift(ManagerSchedulingActionRequest request) {
        User manager = getManager(request.managerId());
        Branch branch = manager.getBranch();
        List<Shift> existingShifts = shiftRepository.findByBranchId(branch.getId());
        LocalDate weekStart = resolveVisibleScheduleWeekStart(existingShifts);
        List<Shift> weekShifts = new ArrayList<>();
        int createdCount = 0;

        for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
            LocalDate shiftDate = weekStart.plusDays(dayOffset);
            for (ShiftTemplate template : getWeeklyTemplates()) {
                Shift existingShift = existingShifts.stream()
                    .filter(shift -> shift.getShiftDate().equals(shiftDate))
                    .filter(shift -> shift.getName().equals(template.name()))
                    .findFirst()
                    .orElse(null);

                if (existingShift != null) {
                    weekShifts.add(existingShift);
                    continue;
                }

                Shift shift = Shift.builder()
                    .name(template.name())
                    .branch(branch)
                    .shiftDate(shiftDate)
                    .startTime(template.startTime())
                    .endTime(template.endTime())
                    .requiredStaff(REQUIRED_SHIFT_ROLES.size())
                    .assignedStaff(0)
                    .status(ShiftStatus.UNDERSTAFFED)
                    .build();
                Shift savedShift = shiftRepository.save(shift);
                weekShifts.add(savedShift);
                createdCount++;
            }
        }

        for (Shift shift : weekShifts) {
            List<ShiftAssignment> existingAssignments = shiftAssignmentRepository.findByShiftId(shift.getId());
            if (!existingAssignments.isEmpty()) {
                shiftAssignmentRepository.deleteAll(existingAssignments);
            }
            shift.setAssignedStaff(0);
            shift.setStatus(ShiftStatus.UNDERSTAFFED);
            shiftRepository.save(shift);
        }

        logAudit(
            manager,
            "Reset weekly shifts",
            "Scheduling",
            "Prepared an empty weekly schedule for " + weekStart + " with " + weekShifts.size() + " shifts. " +
                (createdCount > 0 ? ("Created " + createdCount + " missing shift slot(s) and cleared all assignments.") : "Cleared all existing assignments.")
        );
        return weekShifts.stream()
            .min(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .orElseThrow(() -> new IllegalArgumentException("Unable to prepare the weekly schedule"));
    }

    @Transactional
    public Shift assignAvailableEmployee(ManagerSchedulingActionRequest request) {
        User manager = getManager(request.managerId());
        Shift shift = getEarliestOpenShift(manager.getBranch().getId());
        List<ShiftAssignment> currentAssignments = shiftAssignmentRepository.findByShiftId(shift.getId());
        String missingRole = findMissingRole(currentAssignments);
        User employee = findBestAvailableEmployee(manager, shift, missingRole)
            .orElseThrow(() -> new IllegalArgumentException("No available employee could be assigned to the next open shift"));

        assignEmployeeToShift(manager, employee, shift, "Assigned available staff to understaffed shift");
        queueWeeklyAssignmentSummary(employee, shift.getShiftDate());
        return shiftRepository.save(shift);
    }

    @Transactional
    public List<Shift> autoSchedule(ManagerSchedulingActionRequest request) {
        User manager = getManager(request.managerId());
        List<Shift> openShifts = shiftRepository.findByBranchId(manager.getBranch().getId()).stream()
            .filter(shift -> !shift.getShiftDate().isBefore(LocalDate.now()))
            .filter(shift -> shift.getAssignedStaff() < shift.getRequiredStaff())
            .sorted(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .toList();

        for (Shift shift : openShifts) {
            while (shift.getAssignedStaff() < shift.getRequiredStaff()) {
                String missingRole = findMissingRole(shiftAssignmentRepository.findByShiftId(shift.getId()));
                User employee = findBestAvailableEmployee(manager, shift, missingRole).orElse(null);
                if (employee == null) {
                    break;
                }
                assignEmployeeToShift(manager, employee, shift, "Auto-scheduled available staff into open shift");
            }
            shiftRepository.save(shift);
        }

        queueWeeklyAssignmentSummariesForBranch(manager, openShifts);

        logAudit(manager, "Ran auto schedule", "Scheduling", "Auto scheduling processed " + openShifts.size() + " shift(s).");
        return openShifts;
    }

    @Transactional
    public Shift assignShiftToEmployee(ManualShiftAssignmentRequest request) {
        User manager = getManager(request.managerId());
        User employee = userRepository.findById(request.employeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        validateManagedEmployee(manager, employee);
        Shift shift = findManagedShift(manager, request.shiftDate(), request.shiftName());

        validateAssignableShift(employee, shift);

        String employeeRole = resolveShiftRole(employee);
        if (employeeRole == null || !REQUIRED_SHIFT_ROLES.contains(employeeRole)) {
            throw new IllegalArgumentException("Employee role is not eligible for this shift model");
        }

        String missingRole = findMissingRole(shiftAssignmentRepository.findByShiftId(shift.getId()));
        if (missingRole == null) {
            throw new IllegalArgumentException("This shift is already fully assigned");
        }
        if (!missingRole.equals(employeeRole)) {
            throw new IllegalArgumentException("This shift needs a " + missingRole + ", not " + employeeRole);
        }

        assignEmployeeToShift(manager, employee, shift, "Assigned employee manually to selected shift");
        queueWeeklyAssignmentSummary(employee, shift.getShiftDate());
        return shiftRepository.save(shift);
    }

    @Transactional
    public Shift removeShiftAssignment(RemoveShiftAssignmentRequest request) {
        User manager = getManager(request.managerId());
        User employee = userRepository.findById(request.employeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        validateManagedEmployee(manager, employee);

        Shift shift = findManagedShift(manager, request.shiftDate(), request.shiftName());
        ShiftAssignment assignment = shiftAssignmentRepository.findByShiftId(shift.getId()).stream()
            .filter(item -> item.getEmployee().getId().equals(employee.getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("This employee is not assigned to the selected shift"));

        shiftAssignmentRepository.delete(assignment);
        shift.setAssignedStaff(Math.max(0, shift.getAssignedStaff() - 1));
        updateShiftStaffingStatus(shift);
        shiftRepository.save(shift);

        notificationRepository.save(
            Notification.builder()
                .title("Shift assignment removed")
                .message("You were removed from " + shift.getName() + " on " + shift.getShiftDate() + " by " + manager.getFullName() + ".")
                .priority(NotificationPriority.HIGH)
                .recipient(employee)
                .read(false)
                .build()
        );

        logAudit(
            manager,
            "Removed employee from shift",
            "Scheduling",
            employee.getFullName() + " removed from " + shift.getName() + " on " + shift.getShiftDate() + "."
        );
        queueWeeklyAssignmentSummary(employee, shift.getShiftDate());
        return shift;
    }

    @Transactional
    public Shift reassignShift(ReassignShiftAssignmentRequest request) {
        User manager = getManager(request.managerId());
        User currentEmployee = userRepository.findById(request.currentEmployeeId())
            .orElseThrow(() -> new IllegalArgumentException("Current employee not found"));
        User replacementEmployee = userRepository.findById(request.replacementEmployeeId())
            .orElseThrow(() -> new IllegalArgumentException("Replacement employee not found"));

        validateManagedEmployee(manager, currentEmployee);
        validateManagedEmployee(manager, replacementEmployee);

        if (currentEmployee.getId().equals(replacementEmployee.getId())) {
            throw new IllegalArgumentException("Choose a different employee to reassign this shift");
        }

        Shift shift = findManagedShift(manager, request.shiftDate(), request.shiftName());
        ShiftAssignment currentAssignment = shiftAssignmentRepository.findByShiftId(shift.getId()).stream()
            .filter(item -> item.getEmployee().getId().equals(currentEmployee.getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("The selected assignment could not be found"));

        if (hasSameDayAssignment(replacementEmployee.getId(), shift.getShiftDate())) {
            throw new IllegalArgumentException("Replacement employee already has a shift on this day");
        }

        String currentRole = resolveShiftRole(currentEmployee);
        String replacementRole = resolveShiftRole(replacementEmployee);
        if (currentRole == null || replacementRole == null || !currentRole.equals(replacementRole)) {
            throw new IllegalArgumentException("Replacement employee must have the same role as the current assignment");
        }

        if (isEmployeeAssignedToShift(replacementEmployee.getId(), shift.getId())) {
            throw new IllegalArgumentException("Replacement employee is already assigned to this shift");
        }

        currentAssignment.setEmployee(replacementEmployee);
        currentAssignment.setAssignedAt(LocalDateTime.now());
        shiftAssignmentRepository.save(currentAssignment);
        updateShiftStaffingStatus(shift);
        shiftRepository.save(shift);

        notificationRepository.save(
            Notification.builder()
                .title("Shift reassigned")
                .message("You were removed from " + shift.getName() + " on " + shift.getShiftDate() + " by " + manager.getFullName() + ".")
                .priority(NotificationPriority.HIGH)
                .recipient(currentEmployee)
                .read(false)
                .build()
        );
        notificationRepository.save(
            Notification.builder()
                .title("New shift assignment")
                .message("You have been scheduled for " + shift.getName() + " on " + shift.getShiftDate() + " (" + shift.getStartTime() + "-" + shift.getEndTime() + ").")
                .priority(NotificationPriority.MEDIUM)
                .recipient(replacementEmployee)
                .read(false)
                .build()
        );

        logAudit(
            manager,
            "Reassigned shift",
            "Scheduling",
            "Moved " + shift.getName() + " on " + shift.getShiftDate() + " from " + currentEmployee.getFullName() + " to " + replacementEmployee.getFullName() + "."
        );
        queueWeeklyAssignmentSummary(currentEmployee, shift.getShiftDate());
        queueWeeklyAssignmentSummary(replacementEmployee, shift.getShiftDate());
        return shift;
    }

    private User getManager(Long managerId) {
        User manager = userRepository.findById(managerId)
            .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (manager.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("User is not a manager");
        }
        return manager;
    }

    private Shift getEarliestOpenShift(Long branchId) {
        return shiftRepository.findByBranchId(branchId).stream()
            .filter(shift -> !shift.getShiftDate().isBefore(LocalDate.now()))
            .filter(shift -> shift.getAssignedStaff() < shift.getRequiredStaff())
            .sorted(Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("No understaffed shifts are available"));
    }

    private java.util.Optional<User> findBestAvailableEmployee(User manager, Shift shift, String requiredRole) {
        List<User> branchEmployees = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(employee -> employee.getBranch() != null && employee.getBranch().getId().equals(manager.getBranch().getId()))
            .filter(User::isActive)
            .filter(employee -> requiredRole == null || requiredRole.equals(resolveShiftRole(employee)))
            .toList();

        List<Availability> dayAvailability = availabilityRepository.findByAvailableDate(shift.getShiftDate());
        java.util.Optional<User> explicitAvailabilityMatch = branchEmployees.stream()
            .filter(employee -> !isEmployeeAssignedToShift(employee.getId(), shift.getId()))
            .filter(employee -> !hasSameDayAssignment(employee.getId(), shift.getShiftDate()))
            .filter(employee -> isActuallyAvailable(employee.getId(), shift, dayAvailability))
            .min(Comparator.comparingInt(employee -> shiftAssignmentRepository.findByEmployeeId(employee.getId()).size()));

        if (explicitAvailabilityMatch.isPresent()) {
            return explicitAvailabilityMatch;
        }

        return branchEmployees.stream()
            .filter(employee -> !isEmployeeAssignedToShift(employee.getId(), shift.getId()))
            .filter(employee -> !hasSameDayAssignment(employee.getId(), shift.getShiftDate()))
            .min(Comparator.comparingInt(employee -> shiftAssignmentRepository.findByEmployeeId(employee.getId()).size()));
    }

    private boolean isEmployeeAssignedToShift(Long employeeId, Long shiftId) {
        return shiftAssignmentRepository.findByShiftId(shiftId).stream()
            .anyMatch(item -> item.getEmployee().getId().equals(employeeId));
    }

    private boolean hasSameDayAssignment(Long employeeId, LocalDate shiftDate) {
        return shiftAssignmentRepository.findByEmployeeId(employeeId).stream()
            .map(ShiftAssignment::getShift)
            .anyMatch(existingShift -> existingShift.getShiftDate().equals(shiftDate));
    }

    private Shift findManagedShift(User manager, LocalDate shiftDate, String shiftName) {
        return shiftRepository.findByBranchId(manager.getBranch().getId()).stream()
            .filter(candidate -> candidate.getShiftDate().equals(shiftDate))
            .filter(candidate -> candidate.getName().equals(shiftName))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Selected shift was not found"));
    }

    private void validateManagedEmployee(User manager, User employee) {
        if (employee.getRole() != Role.EMPLOYEE || employee.getBranch() == null || manager.getBranch() == null ||
            !employee.getBranch().getId().equals(manager.getBranch().getId())) {
            throw new IllegalArgumentException("Selected employee does not belong to this pharmacy team");
        }
    }

    private boolean isActuallyAvailable(Long employeeId, Shift shift, List<Availability> dayAvailability) {
        return dayAvailability.stream()
            .filter(item -> item.getEmployee().getId().equals(employeeId))
            .filter(item -> item.getStatus() == AvailabilityStatus.AVAILABLE || item.getStatus() == AvailabilityStatus.PREFERRED)
            .anyMatch(item ->
                (item.getStartTime() == null || !item.getStartTime().isAfter(shift.getStartTime())) &&
                    (item.getEndTime() == null || !item.getEndTime().isBefore(shift.getEndTime()))
            );
    }

    private void assignEmployeeToShift(User manager, User employee, Shift shift, String action) {
        validateAssignableShift(employee, shift);
        ShiftAssignment assignment = ShiftAssignment.builder()
            .shift(shift)
            .employee(employee)
            .assignedAt(LocalDateTime.now())
            .build();
        shiftAssignmentRepository.save(assignment);

        shift.setAssignedStaff(shift.getAssignedStaff() + 1);
        updateShiftStaffingStatus(shift);

        notificationRepository.save(
            Notification.builder()
                .title("New shift assignment")
                .message("You have been scheduled for " + shift.getName() + " on " + shift.getShiftDate() + " (" + shift.getStartTime() + "-" + shift.getEndTime() + ").")
                .priority(NotificationPriority.MEDIUM)
                .recipient(employee)
                .read(false)
                .build()
        );

        sendShiftAssignmentEmail(employee, shift);
        logAudit(manager, action, "Scheduling", employee.getFullName() + " assigned to " + shift.getName() + " on " + shift.getShiftDate() + ".");
    }

    private void sendShiftAssignmentEmail(User employee, Shift shift) {
        if (employee == null || employee.getEmail() == null || employee.getEmail().isBlank()) {
            return;
        }

        credentialEmailService.sendShiftChangeNotice(
            employee.getEmail(),
            employee.getFullName(),
            "New shift assignment - " + shift.getName(),
            "You have been assigned a new shift. Please review the details below.",
            List.of(
                ShiftAssignment.builder()
                    .employee(employee)
                    .shift(shift)
                    .assignedAt(LocalDateTime.now())
                    .build()
            )
        );
    }

    private void validateAssignableShift(User employee, Shift shift) {
        if (shift.getShiftDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot assign shifts on past dates");
        }
        if (isEmployeeAssignedToShift(employee.getId(), shift.getId())) {
            throw new IllegalArgumentException("Employee is already assigned to this shift");
        }
        if (hasSameDayAssignment(employee.getId(), shift.getShiftDate())) {
            throw new IllegalArgumentException("Employee already has a shift on this day");
        }
    }

    private void queueWeeklyAssignmentSummary(User employee, LocalDate referenceDate) {
        if (employee == null || employee.getEmail() == null || employee.getEmail().isBlank()) {
            return;
        }

        Runnable task = () -> sendWeeklyAssignmentSummaryIfAvailable(employee, referenceDate);
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    CompletableFuture.runAsync(task);
                }
            });
            return;
        }

        CompletableFuture.runAsync(task);
    }

    private void sendWeeklyAssignmentSummariesForBranch(User manager, List<Shift> shifts) {
        if (shifts == null || shifts.isEmpty()) {
            return;
        }

        LocalDate weekReference = shifts.stream()
            .map(Shift::getShiftDate)
            .min(LocalDate::compareTo)
            .orElse(LocalDate.now());

        List<User> branchEmployeesWithAssignments = shiftAssignmentRepository.findAll().stream()
            .filter(item -> item.getShift() != null && item.getShift().getBranch() != null)
            .filter(item -> manager.getBranch() != null && item.getShift().getBranch().getId().equals(manager.getBranch().getId()))
            .filter(item -> isWithinScheduleWeek(item.getShift().getShiftDate(), weekReference))
            .map(ShiftAssignment::getEmployee)
            .filter(User::isActive)
            .distinct()
            .toList();

        for (User employee : branchEmployeesWithAssignments) {
            sendWeeklyAssignmentSummaryIfAvailable(employee, weekReference);
        }
    }

    private void queueWeeklyAssignmentSummariesForBranch(User manager, List<Shift> shifts) {
        if (shifts == null || shifts.isEmpty()) {
            return;
        }

        Runnable task = () -> sendWeeklyAssignmentSummariesForBranch(manager, shifts);
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    CompletableFuture.runAsync(task);
                }
            });
            return;
        }

        CompletableFuture.runAsync(task);
    }

    private void sendWeeklyAssignmentSummaryIfAvailable(User employee, LocalDate referenceDate) {
        if (employee == null || employee.getEmail() == null || employee.getEmail().isBlank()) {
            return;
        }

        LocalDate weekStart = referenceDate.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        List<ShiftAssignment> weeklyAssignments = shiftAssignmentRepository.findByEmployeeId(employee.getId()).stream()
            .filter(item -> item.getShift() != null)
            .filter(item -> !item.getShift().getShiftDate().isBefore(weekStart) && !item.getShift().getShiftDate().isAfter(weekEnd))
            .sorted(Comparator.comparing((ShiftAssignment item) -> item.getShift().getShiftDate()).thenComparing(item -> item.getShift().getStartTime()))
            .collect(Collectors.toList());

        if (weeklyAssignments.isEmpty()) {
            return;
        }

        boolean sent = credentialEmailService.sendWeeklyShiftAssignmentSummary(
            employee.getEmail(),
            employee.getFullName(),
            weeklyAssignments
        );

        if (!sent) {
            return;
        }

        return;
    }

    private boolean isWithinScheduleWeek(LocalDate shiftDate, LocalDate referenceDate) {
        LocalDate weekStart = referenceDate.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);
        return !shiftDate.isBefore(weekStart) && !shiftDate.isAfter(weekEnd);
    }

    private void logAudit(User actor, String action, String targetModule, String details) {
        auditLogRepository.save(
            AuditLog.builder()
                .actor(actor)
                .action(action)
                .targetModule(targetModule)
                .actionTime(LocalDateTime.now())
                .details(details)
                .build()
            );
    }

    private String findMissingRole(List<ShiftAssignment> assignments) {
        Set<String> assignedRoles = assignments.stream()
            .map(ShiftAssignment::getEmployee)
            .map(this::resolveShiftRole)
            .filter(role -> role != null && !role.isBlank())
            .collect(java.util.stream.Collectors.toSet());

        return REQUIRED_SHIFT_ROLES.stream()
            .filter(role -> !assignedRoles.contains(role))
            .findFirst()
            .orElse(null);
    }

    private void updateShiftStaffingStatus(Shift shift) {
        if (shift.getAssignedStaff() <= 0) {
            shift.setStatus(ShiftStatus.UNDERSTAFFED);
            return;
        }
        if (shift.getAssignedStaff() >= shift.getRequiredStaff()) {
            shift.setStatus(ShiftStatus.FULL);
            return;
        }
        shift.setStatus(ShiftStatus.PARTIALLY_STAFFED);
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

    private LocalDate resolveNextScheduleWeekStart(List<Shift> existingShifts) {
        LocalDate today = LocalDate.now();
        LocalDate latestShiftDate = existingShifts.stream()
            .map(Shift::getShiftDate)
            .max(LocalDate::compareTo)
            .orElse(today);
        LocalDate referenceDate = latestShiftDate.isAfter(today) ? latestShiftDate.plusDays(1) : today.plusWeeks(1);
        return referenceDate.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.MONDAY));
    }

    private LocalDate resolveVisibleScheduleWeekStart(List<Shift> existingShifts) {
        LocalDate today = LocalDate.now();
        return existingShifts.stream()
            .filter(shift -> !shift.getShiftDate().isBefore(today))
            .filter(shift -> getWeeklyTemplates().stream().anyMatch(template -> template.name().equals(shift.getName())))
            .map(Shift::getShiftDate)
            .min(LocalDate::compareTo)
            .orElseGet(() -> resolveNextScheduleWeekStart(existingShifts));
    }

    private List<ShiftTemplate> getWeeklyTemplates() {
        return List.of(
            new ShiftTemplate("1st Shift", LocalTime.of(7, 0), LocalTime.of(15, 0)),
            new ShiftTemplate("2nd Shift", LocalTime.of(15, 0), LocalTime.of(23, 0))
        );
    }

    private record ShiftTemplate(String name, LocalTime startTime, LocalTime endTime) {
    }
}
