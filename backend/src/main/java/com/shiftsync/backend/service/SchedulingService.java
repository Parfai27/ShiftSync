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
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final ShiftRepository shiftRepository;
    private final BranchRepository branchRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ShiftAdjustmentRequestRepository adjustmentRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

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

        LocalDate nextDate = LocalDate.now().plusDays(1);
        for (int offset = 1; offset <= 7; offset++) {
            LocalDate candidate = LocalDate.now().plusDays(offset);
            long shiftsOnDate = existingShifts.stream()
                .filter(shift -> shift.getShiftDate().equals(candidate))
                .count();
            if (shiftsOnDate < 3) {
                nextDate = candidate;
                break;
            }
        }

        LocalDate selectedDate = nextDate;
        int shiftsForDate = (int) existingShifts.stream()
            .filter(shift -> shift.getShiftDate().equals(selectedDate))
            .count();
        int rotation = shiftsForDate % 3;
        String shiftName = rotation == 0 ? "Opening Shift" : rotation == 1 ? "Dispensing Shift" : "Closing Shift";
        LocalTime start = rotation == 0 ? LocalTime.of(7, 0) : rotation == 1 ? LocalTime.of(8, 0) : LocalTime.of(14, 0);
        LocalTime end = rotation == 0 ? LocalTime.of(15, 0) : rotation == 1 ? LocalTime.of(16, 0) : LocalTime.of(22, 0);
        int requiredStaff = rotation == 2 ? 3 : 4;

        Shift shift = Shift.builder()
            .name(shiftName)
            .branch(branch)
            .shiftDate(nextDate)
            .startTime(start)
            .endTime(end)
            .requiredStaff(requiredStaff)
            .assignedStaff(0)
            .status(ShiftStatus.UNDERSTAFFED)
            .build();

        Shift saved = shiftRepository.save(shift);
        logAudit(manager, "Created shift", "Scheduling", "Created " + shiftName + " for " + nextDate + ".");
        return saved;
    }

    @Transactional
    public Shift assignAvailableEmployee(ManagerSchedulingActionRequest request) {
        User manager = getManager(request.managerId());
        Shift shift = getEarliestOpenShift(manager.getBranch().getId());
        User employee = findBestAvailableEmployee(manager, shift)
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
                User employee = findBestAvailableEmployee(manager, shift).orElse(null);
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

    private java.util.Optional<User> findBestAvailableEmployee(User manager, Shift shift) {
        List<User> branchEmployees = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(employee -> employee.getBranch() != null && employee.getBranch().getId().equals(manager.getBranch().getId()))
            .toList();

        List<Availability> dayAvailability = availabilityRepository.findByAvailableDate(shift.getShiftDate());
        java.util.Optional<User> explicitAvailabilityMatch = branchEmployees.stream()
            .filter(employee -> shiftAssignmentRepository.findByShiftId(shift.getId()).stream().noneMatch(item -> item.getEmployee().getId().equals(employee.getId())))
            .filter(employee -> isActuallyAvailable(employee.getId(), shift, dayAvailability))
            .min(Comparator.comparingInt(employee -> shiftAssignmentRepository.findByEmployeeId(employee.getId()).size()));

        if (explicitAvailabilityMatch.isPresent()) {
            return explicitAvailabilityMatch;
        }

        return branchEmployees.stream()
            .filter(employee -> shiftAssignmentRepository.findByShiftId(shift.getId()).stream().noneMatch(item -> item.getEmployee().getId().equals(employee.getId())))
            .min(Comparator.comparingInt(employee -> shiftAssignmentRepository.findByEmployeeId(employee.getId()).size()));
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
}
