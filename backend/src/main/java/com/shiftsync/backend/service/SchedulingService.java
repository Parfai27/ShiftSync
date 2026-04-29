package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentRequestPayload;
import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentStatusUpdate;
import com.shiftsync.backend.dto.SchedulingDtos.AvailabilityRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ManagerSchedulingActionRequest;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private static final List<String> REQUIRED_SHIFT_ROLES = List.of(
        "Pharmacist",
        "Pharmacy Assistant / Attendant",
        "Store Officer",
        "Cashier"
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
        LocalDate weekStart = resolveNextScheduleWeekStart(existingShifts);
        List<Shift> createdShifts = new ArrayList<>();

        for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
            LocalDate shiftDate = weekStart.plusDays(dayOffset);
            for (ShiftTemplate template : getWeeklyTemplates()) {
                Shift existingShift = existingShifts.stream()
                    .filter(shift -> shift.getShiftDate().equals(shiftDate))
                    .filter(shift -> shift.getName().equals(template.name()))
                    .findFirst()
                    .orElse(null);

                if (existingShift != null) {
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
                createdShifts.add(shiftRepository.save(shift));
            }
        }

        if (createdShifts.isEmpty()) {
            throw new IllegalArgumentException("Weekly shifts already exist for the next schedule window");
        }

        logAudit(
            manager,
            "Created weekly shifts",
            "Scheduling",
            "Created " + createdShifts.size() + " shifts for the week starting " + weekStart + "."
        );
        return createdShifts.get(0);
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

        logAudit(manager, "Ran auto schedule", "Scheduling", "Auto scheduling processed " + openShifts.size() + " shift(s).");
        return openShifts;
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
        ShiftAssignment assignment = ShiftAssignment.builder()
            .shift(shift)
            .employee(employee)
            .assignedAt(LocalDateTime.now())
            .build();
        shiftAssignmentRepository.save(assignment);

        shift.setAssignedStaff(shift.getAssignedStaff() + 1);
        if (shift.getAssignedStaff() >= shift.getRequiredStaff()) {
            shift.setStatus(ShiftStatus.FULL);
        } else {
            shift.setStatus(ShiftStatus.PARTIALLY_STAFFED);
        }

        notificationRepository.save(
            Notification.builder()
                .title("New shift assignment")
                .message("You have been scheduled for " + shift.getName() + " on " + shift.getShiftDate() + " (" + shift.getStartTime() + "-" + shift.getEndTime() + ").")
                .priority(NotificationPriority.MEDIUM)
                .recipient(employee)
                .read(false)
                .build()
        );

        logAudit(manager, action, "Scheduling", employee.getFullName() + " assigned to " + shift.getName() + " on " + shift.getShiftDate() + ".");
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
        if (normalized.contains("store") || normalized.contains("inventory")) {
            return "Store Officer";
        }
        if (normalized.contains("cashier") || normalized.contains("front desk")) {
            return "Cashier";
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

    private List<ShiftTemplate> getWeeklyTemplates() {
        return List.of(
            new ShiftTemplate("Evening Shift", LocalTime.of(23, 0), LocalTime.of(7, 0)),
            new ShiftTemplate("1st Shift", LocalTime.of(7, 0), LocalTime.of(15, 0)),
            new ShiftTemplate("2nd Shift", LocalTime.of(15, 0), LocalTime.of(23, 0))
        );
    }

    private record ShiftTemplate(String name, LocalTime startTime, LocalTime endTime) {
    }
}
