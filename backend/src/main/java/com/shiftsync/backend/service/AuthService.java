package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.AuthDtos.AuthResponse;
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
            "Registration successful"
        );
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
}
