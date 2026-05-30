package com.shiftsync.backend.service;

import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAssignment;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CredentialEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@shiftsync.local}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public boolean isMailConfigured() {
        return mailHost != null && !mailHost.isBlank();
    }

    public boolean sendNewEmployeeCredentials(String recipientEmail, String employeeName, String temporaryPassword) {
        if (!isMailConfigured()) {
            return false;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setFrom(fromAddress);
            helper.setSubject("Your ShiftSync account credentials");
            helper.setText(buildEmailBody(employeeName, recipientEmail, temporaryPassword), false);
            mailSender.send(message);
            return true;
        } catch (MailException | jakarta.mail.MessagingException exception) {
            return false;
        }
    }

    public boolean sendForgotPasswordInstructions(String recipientEmail, String employeeName, String temporaryPassword) {
        if (!isMailConfigured()) {
            return false;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setFrom(fromAddress);
            helper.setSubject("ShiftSync password reset instructions");
            helper.setText(buildForgotPasswordBody(employeeName, recipientEmail, temporaryPassword), false);
            mailSender.send(message);
            return true;
        } catch (MailException | jakarta.mail.MessagingException exception) {
            return false;
        }
    }

    public boolean sendAdminResetCredentials(String recipientEmail, String employeeName, String temporaryPassword) {
        if (!isMailConfigured()) {
            return false;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setFrom(fromAddress);
            helper.setSubject("ShiftSync account reset by admin");
            helper.setText(buildAdminResetBody(employeeName, recipientEmail, temporaryPassword), false);
            mailSender.send(message);
            return true;
        } catch (MailException | jakarta.mail.MessagingException exception) {
            return false;
        }
    }

    public boolean sendUpcomingShiftReminder(String recipientEmail, String employeeName, Shift shift) {
        if (!isMailConfigured()) {
            return false;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setFrom(fromAddress);
            helper.setSubject("Upcoming shift reminder - " + shift.getName());
            helper.setText(buildUpcomingShiftReminderBody(employeeName, shift), false);
            mailSender.send(message);
            return true;
        } catch (MailException | jakarta.mail.MessagingException exception) {
            return false;
        }
    }

    public boolean sendWeeklyShiftAssignmentSummary(String recipientEmail, String employeeName, List<ShiftAssignment> assignments) {
        if (!isMailConfigured() || assignments == null || assignments.isEmpty()) {
            return false;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setFrom(fromAddress);
            helper.setSubject("Your ShiftSync weekly shift assignments");
            helper.setText(buildWeeklyShiftAssignmentBody(employeeName, assignments), false);
            mailSender.send(message);
            return true;
        } catch (MailException | jakarta.mail.MessagingException exception) {
            return false;
        }
    }

    private String buildEmailBody(String employeeName, String recipientEmail, String temporaryPassword) {
        return """
            Hello %s,

            Your ShiftSync employee account has been created successfully.

            Login email: %s
            Temporary password: %s

            Please sign in and change this temporary password on your first login before continuing.

            Sign in here: %s/login

            Regards,
            ShiftSync
            """.formatted(employeeName, recipientEmail, temporaryPassword, frontendUrl);
    }

    private String buildForgotPasswordBody(String employeeName, String recipientEmail, String temporaryPassword) {
        return """
            Hello %s,

            We received a password reset request for your ShiftSync account.

            Login email: %s
            Temporary password: %s

            Please sign in using this temporary password, then change it immediately in your settings before continuing.

            Sign in here: %s/login

            If you did not request this reset, please contact your manager right away.

            Regards,
            ShiftSync
        """.formatted(employeeName, recipientEmail, temporaryPassword, frontendUrl);
    }

    private String buildAdminResetBody(String employeeName, String recipientEmail, String temporaryPassword) {
        return """
            Hello %s,

            A ShiftSync administrator reset your account credentials.

            Login email: %s
            Temporary password: %s

            Please sign in using this temporary password, then change it immediately before continuing.

            Sign in here: %s/login

            Regards,
            ShiftSync
            """.formatted(employeeName, recipientEmail, temporaryPassword, frontendUrl);
    }

    private String buildUpcomingShiftReminderBody(String employeeName, Shift shift) {
        return """
            Hello %s,

            This is a reminder that your next ShiftSync assignment is approaching.

            Shift: %s
            Date: %s
            Time: %s - %s

            Please review your schedule and arrive on time.

            Open your schedule here: %s/employee-schedule

            Regards,
            ShiftSync
            """.formatted(
            employeeName,
            shift.getName(),
            shift.getShiftDate().format(DateTimeFormatter.ofPattern("dd MMMM uuuu")),
            shift.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")),
            shift.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm")),
            frontendUrl
        );
    }

    private String buildWeeklyShiftAssignmentBody(String employeeName, List<ShiftAssignment> assignments) {
        Shift firstShift = assignments.get(0).getShift();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, dd MMMM uuuu");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        StringBuilder lines = new StringBuilder();
        for (ShiftAssignment assignment : assignments) {
            Shift shift = assignment.getShift();
            lines.append("- ")
                .append(shift.getShiftDate().format(dateFormatter))
                .append(" | ")
                .append(shift.getName())
                .append(" | ")
                .append(shift.getStartTime().format(timeFormatter))
                .append(" - ")
                .append(shift.getEndTime().format(timeFormatter))
                .append(System.lineSeparator());
        }

        return """
            Hello %s,

            Your weekly ShiftSync schedule has been assigned.

            Week of: %s

            Assigned shifts:
            %s

            Please review your schedule in ShiftSync for any updates.

            Open your schedule here: %s/employee-schedule

            Regards,
            ShiftSync
            """.formatted(
            employeeName,
            firstShift.getShiftDate().format(DateTimeFormatter.ofPattern("dd MMMM uuuu")),
            lines,
            frontendUrl
        );
    }
}
