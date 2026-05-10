package com.shiftsync.backend.service;

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

    public boolean sendNewEmployeeCredentials(String recipientEmail, String employeeName, String temporaryPassword) {
        if (mailHost == null || mailHost.isBlank()) {
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
}
