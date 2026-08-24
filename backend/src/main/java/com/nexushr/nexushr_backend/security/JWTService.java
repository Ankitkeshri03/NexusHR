package com.nexushr.nexushr_backend.security;

import com.nexushr.nexushr_backend.entity.Role;
import com.nexushr.nexushr_backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class JWTService {

    private final Key signInKey;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JWTService(
            @Value("${security.jwt.secret:change-this-dev-only-jwt-secret-to-a-long-random-value-1234567890}") String secretKey,
            @Value("${security.jwt.access-token-expiration-ms:900000}") long accessTokenExpirationMs,
            @Value("${security.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs
    ) {
        this.signInKey = Keys.hmacShaKeyFor(resolveSigningKeyBytes(secretKey));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, "access", accessTokenExpirationMs);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, "refresh", refreshTokenExpirationMs);
    }

    public LocalDateTime getRefreshTokenExpiry() {
        return LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000);
    }

    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationMs / 1000;
    }

    private String buildToken(User user, String tokenType, long expirationMs) {

        List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .toList();

        return Jwts.builder()
                .setClaims(Map.of(
                        "tokenType", tokenType,
                        "roles", roles
                ))
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signInKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String expectedType) {

        Claims claims = extractAllClaims(token);

        boolean matchesType =
                expectedType.equals(claims.get("tokenType", String.class));

        return matchesType &&
                claims.getExpiration().after(new Date());
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(signInKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private byte[] resolveSigningKeyBytes(String secretKey) {

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalArgumentException(
                    "security.jwt.secret must not be blank"
            );
        }

        byte[] secretBytes =
                secretKey.getBytes(StandardCharsets.UTF_8);

        if (secretBytes.length >= 32) {
            return secretBytes;
        }

        log.warn(
                "security.jwt.secret is shorter than 32 bytes. " +
                        "Use a longer random secret in production."
        );

        return sha256(secretBytes);
    }

    private byte[] sha256(byte[] input) {

        try {
            return MessageDigest
                    .getInstance("SHA-256")
                    .digest(input);

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Unable to derive JWT signing key",
                    ex
            );
        }
    }
}
