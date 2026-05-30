package com.shiftsync.backend.security;

import com.shiftsync.backend.model.Role;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class AuthenticatedUserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final Role role;
    private final boolean active;
    private final String passwordHash;

    public AuthenticatedUserPrincipal(Long userId, String email, Role role, boolean active, String passwordHash) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.active = active;
        this.passwordHash = passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
