package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.AuthDtos.AuthResponse;
import com.shiftsync.backend.dto.AuthDtos.ChangePasswordRequest;
import com.shiftsync.backend.dto.AuthDtos.ForgotPasswordRequest;
import com.shiftsync.backend.dto.AuthDtos.LoginRequest;
import com.shiftsync.backend.dto.AuthDtos.RegisterRequest;
import com.shiftsync.backend.dto.AuthDtos.SessionValidationResponse;
import com.shiftsync.backend.security.AuthenticatedUserPrincipal;
import com.shiftsync.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void changePassword(
        @AuthenticationPrincipal AuthenticatedUserPrincipal principal,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (principal != null && request.userId() != null && !principal.getUserId().equals(request.userId())) {
            throw new IllegalArgumentException("You can only change your own password.");
        }
        authService.changePassword(request);
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @GetMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public SessionValidationResponse validate(@AuthenticationPrincipal AuthenticatedUserPrincipal principal) {
        return new SessionValidationResponse(
            principal.getUserId(),
            principal.getEmail(),
            principal.getRole(),
            "Session is valid"
        );
    }
}
