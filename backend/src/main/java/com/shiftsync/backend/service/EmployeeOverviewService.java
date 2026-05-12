package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeNotificationItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeNotificationsPageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeOverviewResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAnnouncementHighlight;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAnnouncementItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAnnouncementsPageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAssignedShift;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAdjustmentCreateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeCalendarCell;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeCalendarEvent;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeEarningsPageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAvailabilitySlot;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeAvailabilitySlotUpdate;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeInboxItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeNotificationRule;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeNotificationRuleUpdate;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeePayBreakdownItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeePaySummaryCard;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeePayTrendPoint;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeProfilePageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeProfileUpdateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSettingsResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSettingsUpdateRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeShiftAdjustmentItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeePayslipItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeResourceItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeScheduleMetric;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSchedulePageResponse;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeScheduleItem;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeStat;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSwapRequestOption;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeSwapResponseRequest;
import com.shiftsync.backend.dto.OverviewPageDtos.EmployeeWeekDay;
import com.shiftsync.backend.model.EmployeeProfile;
import com.shiftsync.backend.model.Notification;
import com.shiftsync.backend.model.NotificationPriority;
import com.shiftsync.backend.model.PayrollRecord;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.model.SwapResponseStatus;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.model.Announcement;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.Availability;
import com.shiftsync.backend.model.AvailabilityStatus;
import com.shiftsync.backend.repository.AnnouncementRepository;
import com.shiftsync.backend.repository.AvailabilityRepository;
import com.shiftsync.backend.repository.EmployeeProfileRepository;
import com.shiftsync.backend.repository.NotificationRepository;
import com.shiftsync.backend.repository.PayrollRecordRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.text.NumberFormat;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeOverviewService {

    private final UserRepository userRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final NotificationRepository notificationRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final AnnouncementRepository announcementRepository;
    private final ShiftRepository shiftRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ShiftAdjustmentRequestRepository shiftAdjustmentRequestRepository;

    public EmployeeOverviewResponse getEmployeeOverview(Long userId) {
        User employee = requireEmployee(userId);
        User manager = findBranchManager(employee);

        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByEmployeeId(userId).stream()
            .sorted(Comparator.comparing(item -> item.getShift().getShiftDate()))
            .toList();

        PayrollRecord latestPayroll = latestPayroll(userId);

        BigDecimal regularHours = latestPayroll != null ? latestPayroll.getRegularHours() : BigDecimal.ZERO;
        BigDecimal grossPay = latestPayroll != null ? latestPayroll.getGrossPay() : BigDecimal.ZERO;

        boolean hasAssignments = !assignments.isEmpty();

        List<EmployeeStat> stats = hasAssignments
            ? List.of(
                new EmployeeStat("Hours Worked", regularHours.toPlainString(), "/ 40.0", "Current monthly record"),
                new EmployeeStat("Upcoming Shifts", String.valueOf(assignments.size()), "Assigned", "Next shift scheduled"),
                new EmployeeStat("Earned Pay Est.", formatMoney(grossPay), "gross", "Estimated")
            )
            : List.of();

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
                    buildOverviewShiftSubtitle(employee, shift),
                    shift.getShiftDate().getDayOfWeek().name().substring(0, 3),
                    shift.getShiftDate().format(dateFormatter)
                );
            })
            .toList();

        List<EmployeeNotificationItem> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
            .limit(3)
            .map(notification -> mapNotification(notification.getTitle(), notification.getMessage(), notification.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")), !notification.isRead()))
            .toList();

        List<EmployeeResourceItem> resources = hasAssignments ? loadResources(employee) : List.of();

        return new EmployeeOverviewResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            manager != null ? manager.getFullName() : "Manager on duty",
            manager != null ? manager.getRole().name().replace('_', ' ') : "MANAGER",
            manager != null ? manager.getProfileImageUrl() : null,
            stats,
            schedule,
            notifications,
            resources
        );
    }

    public EmployeeSchedulePageResponse getEmployeeSchedule(Long userId) {
        User employee = requireEmployee(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId).orElse(null);
        List<ShiftAssignment> assignments = shiftAssignmentRepository.findByEmployeeId(userId).stream()
            .sorted(
                Comparator.comparing((ShiftAssignment item) -> item.getShift().getShiftDate())
                    .thenComparing(item -> item.getShift().getStartTime())
            )
            .toList();
        PayrollRecord latestPayroll = latestPayroll(userId);

        LocalDate today = LocalDate.now();
        YearMonth month = YearMonth.from(today);
        LocalDate monthStart = month.atDay(1);
        LocalDate monthEnd = month.atEndOfMonth();
        LocalDate calendarStart = monthStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate calendarEnd = monthEnd.with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));

        List<Shift> employeeMonthShifts = assignments.stream()
            .map(ShiftAssignment::getShift)
            .filter(shift -> !shift.getShiftDate().isBefore(monthStart) && !shift.getShiftDate().isAfter(monthEnd))
            .toList();

        List<Shift> branchMonthShifts = employee.getBranch() == null
            ? List.of()
            : shiftRepository.findByBranchId(employee.getBranch().getId()).stream()
                .filter(shift -> !shift.getShiftDate().isBefore(monthStart) && !shift.getShiftDate().isAfter(monthEnd))
                .toList();

        List<EmployeeCalendarCell> calendarCells = new ArrayList<>();
        for (LocalDate date = calendarStart; !date.isAfter(calendarEnd); date = date.plusDays(1)) {
            LocalDate cellDate = date;
            Shift assignedShift = employeeMonthShifts.stream()
                .filter(shift -> shift.getShiftDate().equals(cellDate))
                .findFirst()
                .orElse(null);

            boolean hasOpenShift = branchMonthShifts.stream()
                .filter(shift -> shift.getShiftDate().equals(cellDate))
                .anyMatch(shift -> shift.getAssignedStaff() < shift.getRequiredStaff());

            EmployeeCalendarEvent event = assignedShift == null ? null : new EmployeeCalendarEvent(
                formatWindow(assignedShift),
                assignedShift.getName(),
                (employee.getBranch() != null ? employee.getBranch().getName() : "Pharmacy Shift") + " • " + resolveShiftRole(profile),
                toneForShift(assignedShift),
                cellDate.equals(today) ? "TODAY" : null
            );

            calendarCells.add(new EmployeeCalendarCell(
                cellDate.getDayOfMonth(),
                !cellDate.getMonth().equals(month.getMonth()),
                cellDate.equals(today),
                assignedShift != null,
                assignedShift == null && hasOpenShift,
                event
            ));
        }

        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<EmployeeWeekDay> weekDays = java.util.stream.IntStream.range(0, 7)
            .mapToObj(index -> {
                LocalDate date = weekStart.plusDays(index);
                boolean active = assignments.stream()
                    .map(ShiftAssignment::getShift)
                    .anyMatch(shift -> shift.getShiftDate().equals(date));
                return new EmployeeWeekDay(
                    date.getDayOfWeek().name().substring(0, 3),
                    date.format(DateTimeFormatter.ofPattern("dd")),
                    active
                );
            })
            .toList();

        BigDecimal weeklyHours = BigDecimal.valueOf(assignments.stream()
            .map(ShiftAssignment::getShift)
            .filter(shift -> !shift.getShiftDate().isBefore(weekStart) && !shift.getShiftDate().isAfter(weekStart.plusDays(6)))
            .mapToLong(this::shiftDurationHours)
            .sum());
        long monthlyShiftCount = employeeMonthShifts.size();
        long openShiftCount = branchMonthShifts.stream().filter(shift -> shift.getAssignedStaff() < shift.getRequiredStaff()).count();
        BigDecimal estimatedPay = latestPayroll != null ? latestPayroll.getGrossPay() : BigDecimal.ZERO;

        List<EmployeeScheduleMetric> metrics = List.of(
            new EmployeeScheduleMetric("Scheduled Hours", formatNumber(weeklyHours), "hrs", "This week"),
            new EmployeeScheduleMetric("Estimated Pay", formatMoney(estimatedPay), "gross", latestPayroll != null ? "Current payroll period" : "No payroll yet"),
            new EmployeeScheduleMetric("Monthly Shifts", String.format("%02d", monthlyShiftCount), "assigned", month.getMonth().name()),
            new EmployeeScheduleMetric("Open Shifts", String.format("%02d", openShiftCount), "available", openShiftCount > 0 ? "Pickup opportunities" : "No open shifts")
        );

        List<EmployeeNotificationItem> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
            .limit(3)
            .map(notification -> mapNotification(
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
                !notification.isRead()
            ))
            .toList();

        List<EmployeeAssignedShift> assignedShifts = assignments.stream()
            .filter(item -> !item.getShift().getShiftDate().isBefore(today))
            .map(ShiftAssignment::getShift)
            .map(shift -> new EmployeeAssignedShift(
                shift.getId(),
                shift.getName(),
                shift.getShiftDate().format(DateTimeFormatter.ofPattern("dd MMM uuuu")),
                formatWindow(shift)
            ))
            .toList();

        List<EmployeeSwapRequestOption> swapCandidates = userRepository.findByRole(Role.EMPLOYEE).stream()
            .filter(User::isActive)
            .filter(item -> !item.getId().equals(employee.getId()))
            .filter(item -> item.getBranch() != null && employee.getBranch() != null && item.getBranch().getId().equals(employee.getBranch().getId()))
            .sorted(Comparator.comparing(User::getFullName))
            .map(item -> new EmployeeSwapRequestOption(item.getId(), item.getFullName()))
            .toList();

        List<EmployeeShiftAdjustmentItem> outgoingAdjustments = shiftAdjustmentRequestRepository.findByEmployeeId(userId).stream()
            .sorted(Comparator.comparing(ShiftAdjustmentRequest::getCreatedAt).reversed())
            .map(this::toAdjustmentItem)
            .toList();

        List<EmployeeShiftAdjustmentItem> incomingSwapRequests = shiftAdjustmentRequestRepository.findByTargetEmployeeId(userId).stream()
            .filter(item -> "Shift Swap".equalsIgnoreCase(item.getAdjustmentType()))
            .sorted(Comparator.comparing(ShiftAdjustmentRequest::getCreatedAt).reversed())
            .map(this::toAdjustmentItem)
            .toList();

        return new EmployeeSchedulePageResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            month.format(DateTimeFormatter.ofPattern("MMMM uuuu")),
            "You have " + monthlyShiftCount + " shift" + (monthlyShiftCount == 1 ? "" : "s") + " scheduled in " + month.getMonth().name().toLowerCase() + ".",
            weekDays,
            calendarCells,
            metrics,
            notifications,
            loadResources(employee),
            (int) openShiftCount,
            assignedShifts,
            swapCandidates,
            outgoingAdjustments,
            incomingSwapRequests
        );
    }

    public EmployeeNotificationsPageResponse getEmployeeNotifications(Long userId) {
        User employee = requireEmployee(userId);
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

        List<EmployeeInboxItem> items = notifications.stream()
            .map(notification -> new EmployeeInboxItem(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
                resolveNotificationKind(notification),
                !notification.isRead()
            ))
            .toList();

        long unreadCount = notifications.stream().filter(item -> !item.isRead()).count();
        long scheduleCount = notifications.stream().filter(item -> resolveNotificationKind(item).equals("schedule")).count();
        long systemCount = notifications.stream().filter(item -> resolveNotificationKind(item).equals("system")).count();

        return new EmployeeNotificationsPageResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            notifications.size(),
            unreadCount,
            scheduleCount,
            systemCount,
            items
        );
    }

    public EmployeeAnnouncementsPageResponse getEmployeeAnnouncements(Long userId) {
        User employee = requireEmployee(userId);
        long branchId = employee.getBranch() != null ? employee.getBranch().getId() : 0L;
        List<Announcement> announcements = announcementRepository.findByBranchIdOrderByPublishedAtDesc(branchId);
        LocalDate today = LocalDate.now();
        LocalDate weeklyCutoff = today.minusDays(6);

        List<EmployeeAnnouncementItem> items = announcements.stream()
            .map(announcement -> new EmployeeAnnouncementItem(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getMessage(),
                announcement.getPublishedAt().format(DateTimeFormatter.ofPattern("dd MMM uuuu, HH:mm")),
                announcement.getPublishedBy() != null ? announcement.getPublishedBy().getFullName() : "ShiftSync Team",
                false
            ))
            .toList();

        EmployeeAnnouncementItem featuredAnnouncement = items.isEmpty()
            ? null
            : new EmployeeAnnouncementItem(
                items.get(0).id(),
                items.get(0).title(),
                items.get(0).message(),
                items.get(0).publishedAt(),
                items.get(0).publishedBy(),
                true
            );

        long weeklyAnnouncements = announcements.stream()
            .filter(item -> !item.getPublishedAt().toLocalDate().isBefore(weeklyCutoff))
            .count();

        String latestAnnouncementDate = announcements.isEmpty()
            ? "No announcements yet"
            : announcements.get(0).getPublishedAt().format(DateTimeFormatter.ofPattern("dd MMM uuuu"));

        List<EmployeeAnnouncementHighlight> highlights = List.of(
            new EmployeeAnnouncementHighlight("TOTAL UPDATES", String.valueOf(announcements.size())),
            new EmployeeAnnouncementHighlight("THIS WEEK", String.valueOf(weeklyAnnouncements)),
            new EmployeeAnnouncementHighlight("LATEST POST", latestAnnouncementDate)
        );

        return new EmployeeAnnouncementsPageResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            employee.getBranch() != null ? employee.getBranch().getName() : "Ngabo Pharmacy Team",
            announcements.size(),
            weeklyAnnouncements,
            latestAnnouncementDate,
            featuredAnnouncement,
            highlights,
            items,
            loadResources(employee)
        );
    }

    public EmployeeEarningsPageResponse getEmployeeEarnings(Long userId) {
        User employee = requireEmployee(userId);
        List<PayrollRecord> payrollRecords = payrollRecordRepository.findByEmployeeId(userId).stream()
            .sorted(Comparator.comparing(PayrollRecord::getPeriodEnd).reversed())
            .toList();

        PayrollRecord latestRecord = payrollRecords.isEmpty() ? null : payrollRecords.get(0);
        BigDecimal ytdGross = payrollRecords.stream()
            .filter(item -> item.getPeriodEnd().getYear() == LocalDate.now().getYear())
            .map(PayrollRecord::getGrossPay)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        String currentPeriodValue = latestRecord != null ? formatMoney(latestRecord.getGrossPay()) : "RWF 0";
        String currentPeriodNote = latestRecord != null
            ? latestRecord.getPeriodStart().format(DateTimeFormatter.ofPattern("dd MMM")) + " - " + latestRecord.getPeriodEnd().format(DateTimeFormatter.ofPattern("dd MMM uuuu"))
            : "No payroll period yet";
        LocalDate nextPayDate = latestRecord != null ? latestRecord.getPeriodEnd().plusDays(5) : LocalDate.now().plusDays(5);

        List<EmployeePaySummaryCard> summaryCards = List.of(
            new EmployeePaySummaryCard("Current Month", currentPeriodValue, currentPeriodNote, false),
            new EmployeePaySummaryCard("Next Pay Day", nextPayDate.format(DateTimeFormatter.ofPattern("dd MMM uuuu")), latestRecord != null ? "Estimated monthly payroll release" : "Pending first payroll", true),
            new EmployeePaySummaryCard("Year-to-Date Gross", formatMoney(ytdGross), LocalDate.now().getYear() + " earnings", false)
        );

        BigDecimal maxGross = payrollRecords.stream()
            .map(PayrollRecord::getGrossPay)
            .max(Comparator.naturalOrder())
            .orElse(BigDecimal.ONE);

        List<EmployeePayTrendPoint> trend = payrollRecords.stream()
            .limit(6)
            .sorted(Comparator.comparing(PayrollRecord::getPeriodEnd))
            .map(record -> new EmployeePayTrendPoint(
                record.getPeriodEnd().format(DateTimeFormatter.ofPattern("MMM")),
                formatMoney(record.getGrossPay()),
                scaleHeight(record.getGrossPay(), maxGross)
            ))
            .toList();

        BigDecimal regularHours = latestRecord != null ? latestRecord.getRegularHours() : BigDecimal.ZERO;
        BigDecimal overtimeHours = latestRecord != null ? latestRecord.getOvertimeHours() : BigDecimal.ZERO;
        BigDecimal regularRate = BigDecimal.ZERO;
        if (latestRecord != null && latestRecord.getRegularHours().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal overtimePay = latestRecord.getOvertimeHours().multiply(resolveHourlyRate(employee)).multiply(BigDecimal.valueOf(1.5));
            regularRate = latestRecord.getGrossPay().subtract(overtimePay).divide(latestRecord.getRegularHours(), 2, RoundingMode.HALF_UP);
        }
        BigDecimal overtimeRate = resolveHourlyRate(employee).multiply(BigDecimal.valueOf(1.5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal regularAmount = regularHours.multiply(regularRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal overtimeAmount = overtimeHours.multiply(overtimeRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal gross = latestRecord != null ? latestRecord.getGrossPay() : BigDecimal.ZERO;

        List<EmployeePayBreakdownItem> breakdown = List.of(
            new EmployeePayBreakdownItem(
                "Regular Hours",
                formatNumber(regularHours) + " hrs",
                formatMoney(regularRate) + "/hr",
                formatMoney(regularAmount),
                gross.compareTo(BigDecimal.ZERO) > 0 ? percentageOf(regularAmount, gross) : 0,
                "bg-[#2d5cf6]"
            ),
            new EmployeePayBreakdownItem(
                "Overtime",
                formatNumber(overtimeHours) + " hrs",
                formatMoney(overtimeRate) + "/hr",
                formatMoney(overtimeAmount),
                gross.compareTo(BigDecimal.ZERO) > 0 ? percentageOf(overtimeAmount, gross) : 0,
                "bg-[#bc410d]"
            )
        );

        BigDecimal taxEstimate = gross.multiply(new BigDecimal("0.16")).setScale(2, RoundingMode.HALF_UP);

        List<EmployeePayslipItem> payslips = payrollRecords.stream()
            .limit(6)
            .map(record -> new EmployeePayslipItem(
                record.getId(),
                "Monthly payroll for " + record.getPeriodEnd().format(DateTimeFormatter.ofPattern("MMMM uuuu")),
                "Payroll deposited to your registered account",
                formatMoney(record.getGrossPay().subtract(record.getGrossPay().multiply(new BigDecimal("0.16")))),
                formatMoney(record.getGrossPay()),
                formatNumber(record.getRegularHours()) + " hrs",
                formatNumber(record.getOvertimeHours()) + " hrs"
            ))
            .toList();

        return new EmployeeEarningsPageResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            summaryCards,
            trend,
            breakdown,
            "-RWF " + formatCurrency(taxEstimate),
            payslips
        );
    }

    public EmployeeProfilePageResponse getEmployeeProfile(Long userId) {
        User employee = requireEmployee(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        return new EmployeeProfilePageResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            employee.getFullName(),
            employee.getEmail(),
            nullToEmpty(employee.getProfileImageUrl()),
            profile.getEmployeeCode(),
            profile.getJobTitle(),
            nullToEmpty(profile.getPhoneNumber()),
            profile.getHireDate() != null ? profile.getHireDate().format(DateTimeFormatter.ofPattern("dd MMM uuuu")) : "Not yet recorded",
            profile.getHourlyRate() != null ? formatMoney(profile.getHourlyRate()) + " / hr" : "Not yet recorded",
            nullToEmpty(profile.getEmergencyContactName()),
            nullToEmpty(profile.getEmergencyContactPhone()),
            employee.isActive(),
            employee.getBranch() != null ? employee.getBranch().getName() : "Ngabo Pharmacy Team"
        );
    }

    @Transactional
    public EmployeeProfilePageResponse updateEmployeeProfile(Long userId, EmployeeProfileUpdateRequest request) {
        User employee = requireEmployee(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        String fullName = normalizeRequired(request.fullName(), "Full name");
        if (fullName.length() < 3) {
            throw new IllegalArgumentException("Full name must be at least 3 characters long");
        }

        String phoneNumber = normalizeOptional(request.phoneNumber());
        String emergencyContactName = normalizeOptional(request.emergencyContactName());
        String emergencyContactPhone = normalizeOptional(request.emergencyContactPhone());
        String profileImageUrl = normalizeOptional(request.profileImageUrl());

        validatePhone(phoneNumber, "Mobile phone");
        validatePhone(emergencyContactPhone, "Emergency contact phone");

        if (emergencyContactName != null && emergencyContactName.length() < 3) {
            throw new IllegalArgumentException("Emergency contact name must be at least 3 characters long");
        }

        if (profileImageUrl != null && profileImageUrl.length() > 500) {
            throw new IllegalArgumentException("Profile image link is too long");
        }

        employee.setFullName(fullName);
        employee.setProfileImageUrl(profileImageUrl);
        profile.setPhoneNumber(phoneNumber);
        profile.setEmergencyContactName(emergencyContactName);
        profile.setEmergencyContactPhone(emergencyContactPhone);

        userRepository.save(employee);
        employeeProfileRepository.save(profile);

        return getEmployeeProfile(userId);
    }

    public EmployeeSettingsResponse getEmployeeSettings(Long userId) {
        User employee = requireEmployee(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        return new EmployeeSettingsResponse(
            employee.getFullName(),
            employee.getRole().name().replace('_', ' '),
            employee.getFullName(),
            employee.getEmail(),
            nullToEmpty(employee.getProfileImageUrl()),
            buildAvailabilitySlots(userId),
            buildNotificationRules(profile),
            bool(profile.getHideProfile()),
            bool(profile.getQuietHoursEnabled())
        );
    }

    @Transactional
    public EmployeeSettingsResponse updateEmployeeSettings(Long userId, EmployeeSettingsUpdateRequest request) {
        User employee = requireEmployee(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        String displayName = normalizeRequired(request.displayName(), "Display name");
        if (displayName.length() < 3) {
            throw new IllegalArgumentException("Display name must be at least 3 characters long");
        }

        String profileImageUrl = normalizeOptional(request.profileImageUrl());
        if (profileImageUrl != null && profileImageUrl.length() > 500) {
            throw new IllegalArgumentException("Profile image link is too long");
        }

        employee.setFullName(displayName);
        employee.setProfileImageUrl(profileImageUrl);
        userRepository.save(employee);

        if (request.notificationRules() != null) {
            Map<String, EmployeeNotificationRuleUpdate> rules = request.notificationRules().stream()
                .collect(java.util.stream.Collectors.toMap(
                    item -> item.title().toLowerCase(),
                    item -> item,
                    (left, right) -> right
                ));
            EmployeeNotificationRuleUpdate scheduleRule = rules.get("schedule changes");
            EmployeeNotificationRuleUpdate companyRule = rules.get("company news");
            EmployeeNotificationRuleUpdate teamRule = rules.get("team messages");

            if (scheduleRule != null) {
                profile.setNotifyScheduleChanges(scheduleRule.email() || scheduleRule.push());
            }
            if (companyRule != null) {
                profile.setNotifyCompanyNews(companyRule.email() || companyRule.push());
            }
            if (teamRule != null) {
                profile.setNotifyTeamMessages(teamRule.email() || teamRule.push());
            }
        }

        profile.setHideProfile(request.hideProfile());
        profile.setQuietHoursEnabled(request.quietHoursEnabled());
        employeeProfileRepository.save(profile);

        if (request.availability() != null) {
            upsertWeeklyAvailability(userId, request.availability());
        }

        return getEmployeeSettings(userId);
    }

    @Transactional
    public void updateEmployeeNotification(Long userId, Long notificationId, boolean read) {
        User employee = requireEmployee(userId);
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getRecipient().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Notification does not belong to this employee");
        }

        notification.setRead(read);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllEmployeeNotificationsRead(Long userId) {
        requireEmployee(userId);
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        notifications.forEach(item -> item.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void requestEmployeeTimeOff(Long userId, String note) {
        User employee = requireEmployee(userId);
        ShiftAssignment assignment = shiftAssignmentRepository.findByEmployeeId(userId).stream()
            .filter(item -> !item.getShift().getShiftDate().isBefore(LocalDate.now()))
            .min(Comparator.comparing(item -> item.getShift().getShiftDate()))
            .orElseThrow(() -> new IllegalArgumentException("No upcoming shift found to request time off"));

        ShiftAdjustmentRequest adjustment = ShiftAdjustmentRequest.builder()
            .employee(employee)
            .shift(assignment.getShift())
            .adjustmentType("Time Off Request")
            .requestedChange(note == null || note.isBlank()
                ? "Requesting time off for the upcoming assigned shift."
                : note.trim())
            .status(AdjustmentStatus.PENDING)
            .targetEmployeeResponse(SwapResponseStatus.NOT_REQUIRED)
            .build();
        shiftAdjustmentRequestRepository.save(adjustment);

        notifyBranchManager(
            employee,
            "Time-off request submitted",
            employee.getFullName() + " requested time off for " + assignment.getShift().getName() + " on " + assignment.getShift().getShiftDate() + "."
        );
    }

    @Transactional
    public void requestShiftAdjustment(Long userId, EmployeeAdjustmentCreateRequest request) {
        User employee = requireEmployee(userId);
        if (request == null || request.shiftId() == null) {
            throw new IllegalArgumentException("A shift must be selected for adjustment.");
        }
        String reason = normalizeRequired(request.reason(), "Reason");
        if (reason.length() < 5) {
            throw new IllegalArgumentException("Please provide a more detailed reason for the adjustment.");
        }

        ShiftAssignment assignment = shiftAssignmentRepository.findByEmployeeId(userId).stream()
            .filter(item -> item.getShift().getId().equals(request.shiftId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Selected shift is not assigned to this employee."));

        String type = normalizeRequired(request.adjustmentType(), "Adjustment type");
        if ("TIME_OFF".equalsIgnoreCase(type)) {
            shiftAdjustmentRequestRepository.save(
                ShiftAdjustmentRequest.builder()
                    .employee(employee)
                    .shift(assignment.getShift())
                    .adjustmentType("Time Off Request")
                    .requestedChange(reason)
                    .status(AdjustmentStatus.PENDING)
                    .targetEmployeeResponse(SwapResponseStatus.NOT_REQUIRED)
                    .build()
            );
            notifyBranchManager(
                employee,
                "Time-off request submitted",
                employee.getFullName() + " requested time off for " + assignment.getShift().getName() + " (" + assignment.getShift().getShiftDate() + ")."
            );
            return;
        }

        if (!"SWAP".equalsIgnoreCase(type)) {
            throw new IllegalArgumentException("Unsupported adjustment type.");
        }
        if (request.targetEmployeeId() == null) {
            throw new IllegalArgumentException("Please select a teammate to swap with.");
        }
        User targetEmployee = requireEmployee(request.targetEmployeeId());
        if (targetEmployee.getId().equals(employee.getId())) {
            throw new IllegalArgumentException("You cannot request a swap with yourself.");
        }
        if (
            employee.getBranch() == null ||
            targetEmployee.getBranch() == null ||
            !employee.getBranch().getId().equals(targetEmployee.getBranch().getId())
        ) {
            throw new IllegalArgumentException("Selected teammate is not in your branch.");
        }

        String requesterRole = resolveShiftRole(employeeProfileRepository.findByUserId(employee.getId()).orElse(null));
        String targetRole = resolveShiftRole(employeeProfileRepository.findByUserId(targetEmployee.getId()).orElse(null));
        if (requesterRole == null || targetRole == null || !requesterRole.equals(targetRole)) {
            throw new IllegalArgumentException("Shift swaps are only allowed with a teammate who has the same role.");
        }

        ShiftAssignment targetAssignment = shiftAssignmentRepository.findByEmployeeId(targetEmployee.getId()).stream()
            .filter(item -> item.getShift().getShiftDate().equals(assignment.getShift().getShiftDate()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Selected teammate does not have a shift on the same day to swap."));

        if (targetAssignment.getShift().getId().equals(assignment.getShift().getId())) {
            throw new IllegalArgumentException("Selected teammate is already on the same shift.");
        }

        shiftAdjustmentRequestRepository.save(
            ShiftAdjustmentRequest.builder()
                .employee(employee)
                .shift(assignment.getShift())
                .targetEmployee(targetEmployee)
                .targetShift(targetAssignment.getShift())
                .adjustmentType("Shift Swap")
                .requestedChange(reason)
                .status(AdjustmentStatus.PENDING)
                .targetEmployeeResponse(SwapResponseStatus.PENDING)
                .build()
        );

        notificationRepository.save(
            Notification.builder()
                .title("Shift swap request")
                .message(employee.getFullName() + " requested to swap " + assignment.getShift().getName() + " on " + assignment.getShift().getShiftDate() + ".")
                .priority(NotificationPriority.MEDIUM)
                .recipient(targetEmployee)
                .read(false)
                .build()
        );
        notifyBranchManager(
            employee,
            "Swap request submitted",
            employee.getFullName() + " submitted a shift swap request with " + targetEmployee.getFullName() + "."
        );
    }

    @Transactional
    public void respondToSwapRequest(Long userId, Long adjustmentId, EmployeeSwapResponseRequest request) {
        User responder = requireEmployee(userId);
        ShiftAdjustmentRequest adjustment = shiftAdjustmentRequestRepository.findById(adjustmentId)
            .orElseThrow(() -> new IllegalArgumentException("Adjustment request not found"));

        if (adjustment.getTargetEmployee() == null || !adjustment.getTargetEmployee().getId().equals(responder.getId())) {
            throw new IllegalArgumentException("This swap request is not assigned to the current employee.");
        }
        if (adjustment.getStatus() != AdjustmentStatus.PENDING) {
            throw new IllegalArgumentException("This adjustment has already been finalized by the manager.");
        }

        adjustment.setTargetEmployeeResponse(request.accepted() ? SwapResponseStatus.ACCEPTED : SwapResponseStatus.REJECTED);
        adjustment.setTargetEmployeeNote(normalizeOptional(request.note()));
        adjustment.setTargetRespondedAt(java.time.LocalDateTime.now());
        shiftAdjustmentRequestRepository.save(adjustment);

        notifyBranchManager(
            adjustment.getEmployee(),
            "Swap response recorded",
            responder.getFullName() + " " + (request.accepted() ? "accepted" : "rejected") + " the swap for " + adjustment.getShift().getName() + "."
        );
    }

    @Transactional
    public void contactManager(Long userId, String message) {
        User employee = requireEmployee(userId);
        notifyBranchManager(
            employee,
            "Message from employee",
            (message == null || message.isBlank())
                ? employee.getFullName() + " sent a new message from employee workspace."
                : employee.getFullName() + ": " + message.trim()
        );
    }

    private User requireEmployee(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
    }

    private PayrollRecord latestPayroll(Long userId) {
        return payrollRecordRepository.findByEmployeeId(userId).stream()
            .max(Comparator.comparing(PayrollRecord::getPeriodEnd))
            .orElse(null);
    }

    private List<EmployeeResourceItem> loadResources(User employee) {
        long branchId = employee.getBranch() != null ? employee.getBranch().getId() : 0L;
        return announcementRepository.findByBranchIdOrderByPublishedAtDesc(branchId).stream()
            .limit(4)
            .map(announcement -> new EmployeeResourceItem(announcement.getTitle()))
            .toList();
    }

    private EmployeeNotificationItem mapNotification(String title, String detail, String when, boolean active) {
        return new EmployeeNotificationItem(title, detail, when, active);
    }

    private String buildOverviewShiftSubtitle(User employee, Shift shift) {
        String pharmacyLabel = employee.getBranch() != null && employee.getBranch().getName() != null
            ? employee.getBranch().getName()
            : "Pharmacy shift";
        return pharmacyLabel + " - " + shift.getRequiredStaff() + " staff required";
    }

    private String resolveNotificationKind(Notification notification) {
        String title = notification.getTitle() == null ? "" : notification.getTitle().toLowerCase();
        String message = notification.getMessage() == null ? "" : notification.getMessage().toLowerCase();
        if (notification.getPriority() == NotificationPriority.HIGH || title.contains("shift") || title.contains("schedule") || message.contains("shift")) {
            return "schedule";
        }
        if (title.contains("pay") || title.contains("payroll")) {
            return "pay";
        }
        return "system";
    }

    private long shiftDurationHours(Shift shift) {
        int startHour = shift.getStartTime().getHour();
        int endHour = shift.getEndTime().getHour();
        int duration = endHour - startHour;
        return duration > 0 ? duration : duration + 24L;
    }

    private String formatWindow(Shift shift) {
        return shift.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")) + " - " + shift.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String toneForShift(Shift shift) {
        String name = shift.getName() == null ? "" : shift.getName().toLowerCase();
        if (name.contains("evening")) {
            return "border-l-[#4f46e5] bg-[#eef2ff] text-[#3730a3]";
        }
        if (name.contains("1st")) {
            return "border-l-[#2d5cf6] bg-[#eaf0ff] text-[#2346b7]";
        }
        return "border-l-[#0f766e] bg-[#ecfeff] text-[#115e59]";
    }

    private String resolveShiftRole(EmployeeProfile profile) {
        return profile != null && profile.getJobTitle() != null ? profile.getJobTitle() : "Pharmacy Staff";
    }

    private String formatNumber(BigDecimal value) {
        return value.stripTrailingZeros().scale() > 0 ? value.stripTrailingZeros().toPlainString() : value.setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private String formatCurrency(BigDecimal value) {
        BigDecimal normalized = value == null ? BigDecimal.ZERO : value.setScale(0, RoundingMode.HALF_UP);
        NumberFormat formatter = NumberFormat.getIntegerInstance(Locale.US);
        formatter.setGroupingUsed(true);
        formatter.setMaximumFractionDigits(0);
        formatter.setMinimumFractionDigits(0);
        return formatter.format(normalized);
    }

    private String formatMoney(BigDecimal value) {
        return "RWF " + formatCurrency(value);
    }

    private BigDecimal resolveHourlyRate(User employee) {
        return employeeProfileRepository.findByUserId(employee.getId())
            .map(EmployeeProfile::getHourlyRate)
            .orElse(BigDecimal.ZERO);
    }

    private int scaleHeight(BigDecimal value, BigDecimal max) {
        if (max.compareTo(BigDecimal.ZERO) <= 0) {
            return 24;
        }
        int scaled = value.multiply(BigDecimal.valueOf(100))
            .divide(max, 0, RoundingMode.HALF_UP)
            .intValue();
        return Math.max(24, Math.min(132, scaled + 20));
    }

    private int percentageOf(BigDecimal value, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        return value.multiply(BigDecimal.valueOf(100)).divide(total, 0, RoundingMode.HALF_UP).intValue();
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private void validatePhone(String value, String fieldName) {
        if (value == null) {
            return;
        }
        if (!value.matches("^[0-9+()\\-\\s]{7,20}$")) {
            throw new IllegalArgumentException(fieldName + " must contain only digits and standard phone symbols");
        }
    }

    private List<EmployeeNotificationRule> buildNotificationRules(EmployeeProfile profile) {
        return List.of(
            new EmployeeNotificationRule(
                "Schedule Changes",
                "Alerts when your shifts are modified",
                bool(profile.getNotifyScheduleChanges()),
                bool(profile.getNotifyScheduleChanges())
            ),
            new EmployeeNotificationRule(
                "Company News",
                "General announcements and updates",
                bool(profile.getNotifyCompanyNews()),
                bool(profile.getNotifyCompanyNews())
            ),
            new EmployeeNotificationRule(
                "Team Messages",
                "Direct messages from colleagues",
                bool(profile.getNotifyTeamMessages()),
                bool(profile.getNotifyTeamMessages())
            )
        );
    }

    private List<EmployeeAvailabilitySlot> buildAvailabilitySlots(Long userId) {
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Map<LocalDate, Availability> byDate = availabilityRepository.findByEmployeeId(userId).stream()
            .filter(item -> !item.getAvailableDate().isBefore(weekStart) && !item.getAvailableDate().isAfter(weekStart.plusDays(6)))
            .collect(java.util.stream.Collectors.toMap(
                Availability::getAvailableDate,
                item -> item,
                (left, right) -> left
            ));

        List<String> dayLabels = List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");
        List<EmployeeAvailabilitySlot> slots = new ArrayList<>();
        for (int i = 0; i < dayLabels.size(); i++) {
            LocalDate date = weekStart.plusDays(i);
            Availability availability = byDate.get(date);
            boolean active = availability != null && availability.getStatus() != AvailabilityStatus.UNAVAILABLE;
            String time = "Off";
            if (active && availability != null && availability.getStartTime() != null && availability.getEndTime() != null) {
                time = availability.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm"))
                    + " - "
                    + availability.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));
            }
            slots.add(new EmployeeAvailabilitySlot(dayLabels.get(i), time, active));
        }
        return slots;
    }

    private void upsertWeeklyAvailability(Long userId, List<EmployeeAvailabilitySlotUpdate> slots) {
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Map<String, LocalDate> dateByLabel = Map.of(
            "MON", weekStart,
            "TUE", weekStart.plusDays(1),
            "WED", weekStart.plusDays(2),
            "THU", weekStart.plusDays(3),
            "FRI", weekStart.plusDays(4),
            "SAT", weekStart.plusDays(5),
            "SUN", weekStart.plusDays(6)
        );

        List<Availability> existing = availabilityRepository.findByEmployeeId(userId);
        for (EmployeeAvailabilitySlotUpdate slot : slots) {
            LocalDate date = dateByLabel.get(slot.day());
            if (date == null) {
                continue;
            }
            Availability availability = existing.stream()
                .filter(item -> item.getAvailableDate().equals(date))
                .findFirst()
                .orElseGet(() -> {
                    Availability created = new Availability();
                    created.setEmployee(requireEmployee(userId));
                    created.setAvailableDate(date);
                    return created;
                });

            if (!slot.active()) {
                availability.setStatus(AvailabilityStatus.UNAVAILABLE);
                availability.setStartTime(null);
                availability.setEndTime(null);
                availability.setNotes("Marked unavailable from settings");
                availabilityRepository.save(availability);
                continue;
            }

            availability.setStatus(AvailabilityStatus.AVAILABLE);
            LocalTime[] window = parseAvailabilityWindow(slot.time());
            availability.setStartTime(window[0]);
            availability.setEndTime(window[1]);
            availability.setNotes("Updated from employee settings");
            availabilityRepository.save(availability);
        }
    }

    private LocalTime[] parseAvailabilityWindow(String timeRange) {
        if (timeRange == null || timeRange.isBlank() || "off".equalsIgnoreCase(timeRange.trim())) {
            return new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(17, 0) };
        }
        String[] parts = timeRange.split("-");
        if (parts.length != 2) {
            return new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(17, 0) };
        }
        try {
            return new LocalTime[] { LocalTime.parse(parts[0].trim()), LocalTime.parse(parts[1].trim()) };
        } catch (Exception ignored) {
            return new LocalTime[] { LocalTime.of(9, 0), LocalTime.of(17, 0) };
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private EmployeeShiftAdjustmentItem toAdjustmentItem(ShiftAdjustmentRequest request) {
        String shiftLabel = request.getShift().getName()
            + " • "
            + request.getShift().getShiftDate().format(DateTimeFormatter.ofPattern("dd MMM uuuu"))
            + " • "
            + formatWindow(request.getShift());
        return new EmployeeShiftAdjustmentItem(
            request.getId(),
            request.getShift().getId(),
            shiftLabel,
            request.getAdjustmentType(),
            request.getRequestedChange(),
            request.getStatus().name(),
            request.getTargetEmployee() != null ? request.getTargetEmployee().getFullName() : null,
            request.getTargetEmployeeResponse() != null ? request.getTargetEmployeeResponse().name() : "NOT_REQUIRED"
        );
    }

    private boolean bool(Boolean value) {
        return Boolean.TRUE.equals(value);
    }

    private void notifyBranchManager(User employee, String title, String message) {
        User manager = findBranchManager(employee);
        if (manager == null) {
            return;
        }

        notificationRepository.save(
            Notification.builder()
                .title(title)
                .message(message)
                .priority(NotificationPriority.MEDIUM)
                .recipient(manager)
                .read(false)
                .build()
        );
    }

    private User findBranchManager(User employee) {
        if (employee.getBranch() == null) {
            return null;
        }

        return userRepository.findByRole(com.shiftsync.backend.model.Role.MANAGER).stream()
            .filter(User::isActive)
            .filter(item -> item.getBranch() != null && item.getBranch().getId().equals(employee.getBranch().getId()))
            .findFirst()
            .orElse(null);
    }
}
