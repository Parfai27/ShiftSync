package com.shiftsync.backend.security;

import com.shiftsync.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMinutes;
    private final long rememberExpirationDays;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expiration-minutes}") long expirationMinutes,
        @Value("${app.jwt.remember-expiration-days}") long rememberExpirationDays
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
        this.rememberExpirationDays = rememberExpirationDays;
    }

    public String generateToken(User user, boolean rememberMe) {
        Instant now = Instant.now();
        Instant expiresAt = rememberMe
            ? now.plus(rememberExpirationDays, ChronoUnit.DAYS)
            : now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
            .subject(user.getEmail())
            .claim("uid", user.getId())
            .claim("role", user.getRole().name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(secretKey)
            .compact();
    }

    public Instant extractExpiration(String token) {
        return extractAllClaims(token).getExpiration().toInstant();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Number userId = extractAllClaims(token).get("uid", Number.class);
        return userId == null ? null : userId.longValue();
    }

    public boolean isTokenValid(String token, User user) {
        String email = extractEmail(token);
        return email.equalsIgnoreCase(user.getEmail()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).isBefore(Instant.now());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
