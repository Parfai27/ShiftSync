package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeNotificationItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeOverviewResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeResourceItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeScheduleItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeStat;
import com.shiftsync.backend.model.PayrollRecord;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AnnouncementRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.PayrollRecordRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeOverviewService {

    private final UserRepository userRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final NotificationRepository notificationRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final AnnouncementRepository announcementRepository;

    public EmployeeOverviewResponse getEmployeeOverview(Long userId) {
        User employee = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByEmployeeId(userId).stream()
            .sorted(Comparator.comparing(item -> item.getShift().getShiftDate()))
            .toList();

        List<PayrollRecord> payrollRecords = payrollRecordRepository.findByEmployeeId(userId);
        PayrollRecord latestPayroll = payrollRecords.stream()
            .max(Comparator.comparing(PayrollRecord::getPeriodEnd))
            .orElse(null);

        BigDecimal regularHours = latestPayroll != null ? latestPayroll.getRegularHours() : BigDecimal.ZERO;
        BigDecimal grossPay = latestPayroll != null ? latestPayroll.getGrossPay() : BigDecimal.ZERO;

        List<EmployeeStat> stats = List.of(
            new EmployeeStat("Hours Worked", regularHours.toPlainString(), "/ 40.0", "~81% of Goal"),
            new EmployeeStat("Upcoming Shifts", String.valueOf(assignments.size()), "This Week", assignments.isEmpty() ? "No shift assigned" : "Next shift scheduled"),
            new EmployeeStat("Earned Pay Est.", "$" + grossPay.toPlainString(), "gross", "Estimated"),
            new EmployeeStat("Performance Score", "94%", "Trusted", "A")
        );

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        List<EmployeeScheduleItem> schedule = assignments.stream()
            .limit(3)
            .map(assignment -> {
                var shift = assignment.getShift();
                String slot = shift.getStartTime().getHour() < 12 ? "AM" : "PM";
                return new EmployeeScheduleItem(
                    shift.getStartTime().toString(),
                    slot,
                    shift.getName(),
                    "Ngabo Pharmacy Shift - " + shift.getRequiredStaff() + " staff required",
                    shift.getShiftDate().getDayOfWeek().name().substring(0, 3),
                    shift.getShiftDate().format(dateFormatter)
                );
            })
            .toList();

        List<EmployeeNotificationItem> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
            .limit(3)
            .map(notification -> new EmployeeNotificationItem(
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
                !notification.isRead()
            ))
            .toList();

        long branchId = employee.getBranch() != null ? employee.getBranch().getId() : 0L;
        List<EmployeeResourceItem> resources = announcementRepository.findByBranchIdOrderByPublishedAtDesc(branchId).stream()
            .limit(4)
            .map(announcement -> new EmployeeResourceItem(announcement.getTitle()))
            .toList();

        return new EmployeeOverviewResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            stats,
            schedule,
            notifications,
            resources
        );
    }
}
