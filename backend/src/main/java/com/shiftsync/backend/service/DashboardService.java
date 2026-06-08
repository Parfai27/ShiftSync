package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.DashboardDtos.AdjustmentSummary;
import com.shiftsync.backend.dto.DashboardDtos.MetricCard;
import com.shiftsync.backend.dto.DashboardDtos.OverviewResponse;
import com.shiftsync.backend.dto.DashboardDtos.ShiftStatusCard;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final DateTimeFormatter SHIFT_TIME = DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);
    private static final DateTimeFormatter REQUEST_DATE = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftAdjustmentRequestRepository adjustmentRepository;
    private final NotificationRepository notificationRepository;

    public OverviewResponse getOverview(Long managerId, int rangeDays) {
        User manager = userRepository.findById(managerId)
            .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (manager.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Requested user is not a manager");
        }

        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(Math.max(0, rangeDays - 1L));
        List<User> branchEmployees = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(user -> user.getBranch() != null && manager.getBranch() != null)
            .filter(user -> user.getBranch().getId().equals(manager.getBranch().getId()))
            .filter(User::isActive)
            .toList();

        List<Shift> branchShifts = shiftRepository.findByBranchId(manager.getBranch().getId()).stream()
            .filter(shift -> !shift.getShiftDate().isBefore(today))
            .filter(shift -> !shift.getShiftDate().isAfter(endDate))
            .sorted(java.util.Comparator.comparing(Shift::getShiftDate).thenComparing(Shift::getStartTime))
            .toList();

        List<com.shiftsync.backend.model.ShiftAdjustmentRequest> branchAdjustments = adjustmentRepository.findAll().stream()
            .filter(item -> item.getEmployee().getBranch() != null && item.getEmployee().getBranch().getId().equals(manager.getBranch().getId()))
            .filter(item -> !item.getCreatedAt().toLocalDate().isBefore(today.minusDays(Math.max(0, rangeDays - 1L))))
            .sorted(java.util.Comparator.comparing(com.shiftsync.backend.model.ShiftAdjustmentRequest::getCreatedAt).reversed())
            .toList();

        long pendingAdjustments = branchAdjustments.stream().filter(item -> item.getStatus() == AdjustmentStatus.PENDING).count();
        int requiredStaff = branchShifts.stream().mapToInt(Shift::getRequiredStaff).sum();
        int assignedStaff = branchShifts.stream().mapToInt(Shift::getAssignedStaff).sum();
        int coverage = requiredStaff == 0 ? 0 : (int) Math.round((assignedStaff * 100.0) / requiredStaff);
        long understaffedCount = branchShifts.stream().filter(shift -> shift.getAssignedStaff() < shift.getRequiredStaff()).count();
        long fullShifts = branchShifts.stream().filter(shift -> shift.getAssignedStaff() >= shift.getRequiredStaff()).count();
        long partialShifts = branchShifts.stream().filter(shift -> shift.getAssignedStaff() > 0 && shift.getAssignedStaff() < shift.getRequiredStaff()).count();
        long openShifts = branchShifts.stream().filter(shift -> shift.getAssignedStaff() == 0).count();
        long unreadNotifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(managerId).stream()
            .filter(item -> !item.isRead())
            .count();

        List<MetricCard> metrics = List.of(
            new MetricCard("Total Employees", String.valueOf(branchEmployees.size()), branchEmployees.isEmpty() ? "No staff" : "Active", branchEmployees.size() + " active team members in the pharmacy"),
            new MetricCard("Scheduled Shifts", String.valueOf(branchShifts.size()), branchShifts.isEmpty() ? "No shifts" : "This Window", fullShifts + " covered • " + partialShifts + " partial • " + openShifts + " open"),
            new MetricCard("Staffing Coverage", coverage + "%", coverage >= 90 ? "Healthy" : "Watch", assignedStaff + " of " + requiredStaff + " required role slots filled"),
            new MetricCard("Pending Adjustments", String.valueOf(pendingAdjustments), pendingAdjustments > 0 ? "Review" : "Clear", pendingAdjustments + " requests waiting for manager action")
        );

        List<ShiftStatusCard> shiftStatuses = branchShifts.stream()
            .collect(Collectors.toMap(
                Shift::getName,
                Function.identity(),
                (left, right) -> left.getShiftDate().isBefore(right.getShiftDate()) ? left : right,
                LinkedHashMap::new
            ))
            .values()
            .stream()
            .map(shift -> new ShiftStatusCard(
                shift.getName(),
                shift.getStartTime().format(SHIFT_TIME) + " - " + shift.getEndTime().format(SHIFT_TIME),
                shift.getAssignedStaff() + "/" + shift.getRequiredStaff(),
                shift.getStatus().name(),
                shift.getShiftDate().toString()
            ))
            .toList();

        List<AdjustmentSummary> recentAdjustments = branchAdjustments.stream()
            .limit(5)
            .map(item -> new AdjustmentSummary(
                item.getEmployee().getFullName(),
                item.getAdjustmentType(),
                item.getShift().getName(),
                item.getRequestedChange(),
                item.getStatus().name(),
                item.getCreatedAt().format(REQUEST_DATE)
            ))
            .toList();

        List<String> weekLabels = java.util.stream.IntStream.range(0, 7)
            .mapToObj(index -> today.plusDays(index).getDayOfWeek().name().substring(0, 3))
            .toList();

        List<Integer> attendanceBars = java.util.stream.IntStream.range(0, 7)
            .mapToObj(index -> {
                LocalDate targetDate = today.plusDays(index);
                List<Shift> dayShifts = branchShifts.stream()
                    .filter(shift -> shift.getShiftDate().equals(targetDate))
                    .toList();
                int dayRequired = dayShifts.stream().mapToInt(Shift::getRequiredStaff).sum();
                int dayAssigned = dayShifts.stream().mapToInt(Shift::getAssignedStaff).sum();
                return dayRequired == 0 ? 20 : Math.max(20, (int) Math.round((dayAssigned * 100.0) / dayRequired));
            })
            .toList();

        List<String> heatmap = java.util.stream.IntStream.range(0, 14)
            .mapToObj(index -> {
                Shift shift = index < branchShifts.size() ? branchShifts.get(index) : null;
                if (shift == null) {
                    return "low";
                }
                if (shift.getAssignedStaff() >= shift.getRequiredStaff()) {
                    return "high";
                }
                if (shift.getAssignedStaff() > 0) {
                    return "medium";
                }
                return "low";
            })
            .toList();

        String alertTitle = understaffedCount > 0
            ? "Staffing Alert: " + understaffedCount + " open shift" + (understaffedCount == 1 ? "" : "s")
            : "Coverage Stable Across Scheduled Shifts";
        String alertDescription = understaffedCount > 0
            ? "Open coverage remains in the active schedule window. Assign available staff or auto-schedule to close the gap."
            : "Current scheduled shifts are fully covered for the selected period.";

        return new OverviewResponse(metrics, shiftStatuses, recentAdjustments, attendanceBars, weekLabels, heatmap, alertTitle, alertDescription, unreadNotifications);
    }
}
