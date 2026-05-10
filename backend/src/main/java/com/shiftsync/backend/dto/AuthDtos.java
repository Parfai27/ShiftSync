package com.shiftsync.backend.dto;

import com.shiftsync.backend.model.Role;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
        @NotBlank String email,
        @NotBlank String password
    ) {
    }

    public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank String username,
        @NotBlank String email,
        @NotBlank String password,
        Role role,
        Long branchId
    ) {
    }

    public record ChangePasswordRequest(
        Long userId,
        @NotBlank String currentPassword,
        @NotBlank String newPassword
    ) {
    }

    public record AuthResponse(
        Long userId,
        String fullName,
        String username,
        String email,
        Role role,
        Long branchId,
        String profileImageUrl,
        boolean mustChangePassword,
        String message
    ) {
    }
}
