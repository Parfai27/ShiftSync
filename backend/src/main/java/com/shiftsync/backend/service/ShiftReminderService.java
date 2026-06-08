package com.shiftsync.backend.service;

import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAssignment;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.ShiftAssignmentRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShiftReminderService {

    private static final String REMINDER_ACTION = "Shift reminder email sent";
    private static final String REMINDER_MODULE = "Scheduling";

    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final CredentialEmailService credentialEmailService;

    @Scheduled(cron = "${app.shift-reminders.cron:0 0 * * * *}")
    @Transactional
    public void sendUpcomingShiftReminders() {
        if (!credentialEmailService.isMailConfigured()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindowEnd = now.plusHours(24);

        for (ShiftAssignment assignment : shiftAssignmentRepository.findAll()) {
            User employee = assignment.getEmployee();
            Shift shift = assignment.getShift();
            if (employee == null || shift == null || !employee.isActive() || employee.getEmail() == null || employee.getEmail().isBlank()) {
                continue;
            }

            LocalDateTime shiftStart = LocalDateTime.of(shift.getShiftDate(), shift.getStartTime());
            if (shiftStart.isBefore(now) || shiftStart.isAfter(reminderWindowEnd)) {
                continue;
            }

            String marker = "assignmentId=" + assignment.getId();
            if (auditLogRepository.existsByActionAndTargetModuleAndDetailsContaining(REMINDER_ACTION, REMINDER_MODULE, marker)) {
                continue;
            }

            boolean sent = credentialEmailService.sendUpcomingShiftReminder(employee.getEmail(), employee.getFullName(), shift);
            if (!sent) {
                continue;
            }

            auditLogRepository.save(
                AuditLog.builder()
                    .actor(null)
                    .action(REMINDER_ACTION)
                    .targetModule(REMINDER_MODULE)
                    .actionTime(LocalDateTime.now())
                    .details(marker + "; shift=" + shift.getName() + "; date=" + shift.getShiftDate())
                    .build()
            );

        }
    }
}
