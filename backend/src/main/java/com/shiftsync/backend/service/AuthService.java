package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.AuthDtos.AuthResponse;
import com.shiftsync.backend.dto.AuthDtos.ChangePasswordRequest;
import com.shiftsync.backend.dto.AuthDtos.ForgotPasswordRequest;
import com.shiftsync.backend.model.AuditLog;
import com.shiftsync.backend.dto.AuthDtos.LoginRequest;
import com.shiftsync.backend.dto.AuthDtos.RegisterRequest;
import com.shiftsync.backend.model.Branch;
import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AuditLogRepository;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final CredentialEmailService credentialEmailService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            logLoginActivity(null, "Login failed", "Unknown email: " + request.email());
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            logLoginActivity(user, "Login failed", "Incorrect password for " + user.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }

        logLoginActivity(user, "Login successful", "User signed in with email " + user.getEmail());

        return new AuthResponse(
            user.getId(),
            user.getFullName(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getBranch() != null ? user.getBranch().getId() : null,
            user.getProfileImageUrl(),
            user.isMustChangePassword(),
            "Login successful"
        );
    }

    public AuthResponse register(RegisterRequest request) {
        Branch branch = null;
        if (request.branchId() != null) {
            branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
        }

        User user = User.builder()
            .fullName(request.fullName())
            .username(request.username())
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(request.role() == null ? Role.EMPLOYEE : request.role())
            .branch(branch)
            .active(true)
            .mustChangePassword(false)
            .build();

        userRepository.save(user);
        logLoginActivity(user, "Registration successful", "New " + user.getRole().name() + " account registered with email " + user.getEmail());
        return new AuthResponse(
            user.getId(),
            user.getFullName(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getBranch() != null ? user.getBranch().getId() : null,
            user.getProfileImageUrl(),
            user.isMustChangePassword(),
            "Registration successful"
        );
    }

    public void changePassword(ChangePasswordRequest request) {
        if (request.userId() == null) {
            throw new IllegalArgumentException("User id is required");
        }
        if (request.newPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        logLoginActivity(user, "Password changed", "User changed account password");
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ENGLISH);
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            logLoginActivity(null, "Password reset requested", "Password reset requested for unknown email: " + normalizedEmail);
            return;
        }

        String temporaryPassword = generateTemporaryPassword(user);
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        boolean emailSent = credentialEmailService.sendForgotPasswordInstructions(
            user.getEmail(),
            user.getFullName(),
            temporaryPassword
        );

        logLoginActivity(
            user,
            emailSent ? "Password reset emailed" : "Password reset generated",
            emailSent
                ? "Temporary password instructions emailed to " + user.getEmail()
                : "Temporary password generated, but email delivery failed for " + user.getEmail()
        );

        if (!emailSent) {
            throw new IllegalArgumentException("Password reset instructions could not be emailed right now. Please try again later.");
        }
    }

    private void logLoginActivity(User actor, String action, String details) {
        auditLogRepository.save(
            AuditLog.builder()
                .actor(actor)
                .action(action)
                .targetModule("Authentication")
                .actionTime(LocalDateTime.now())
                .details(details)
                .build()
        );
    }

    private String generateTemporaryPassword(User user) {
        String seed = user.getFullName() == null ? "ShiftSync" : user.getFullName().replaceAll("[^A-Za-z]", "");
        String prefix = seed.isBlank() ? "ShiftSync" : seed.substring(0, Math.min(4, seed.length()));
        String suffix = String.valueOf(System.currentTimeMillis());
        return prefix + "@" + suffix.substring(Math.max(0, suffix.length() - 6));
    }
}
