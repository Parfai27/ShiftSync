package com.shiftsync.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthenticatedUserPrincipal currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUserPrincipal principal)) {
            return null;
        }
        return principal;
    }

    public static Long currentUserId() {
        AuthenticatedUserPrincipal principal = currentUser();
        return principal == null ? null : principal.getUserId();
    }
}
