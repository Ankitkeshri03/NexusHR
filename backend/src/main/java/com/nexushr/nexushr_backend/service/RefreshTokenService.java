package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.RefreshToken;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public void store(User user, String refreshToken, LocalDateTime expiresAt, String issuedFor) {
        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(hash(refreshToken));
        entity.setExpiresAt(expiresAt);
        entity.setIssuedFor(issuedFor);
        refreshTokenRepository.save(entity);
    }

    public void validateActiveToken(User user, String refreshToken) {
        RefreshToken entity = refreshTokenRepository.findByTokenHash(hash(refreshToken))
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Refresh token has been revoked"));

        if (!entity.getUser().getId().equals(user.getId()) ||
                entity.getRevokedAt() != null ||
                entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Refresh token has been revoked");
        }
    }

    public void revoke(String refreshToken) {
        refreshTokenRepository.findByTokenHash(hash(refreshToken))
                .ifPresent(token -> {
                    if (token.getRevokedAt() == null) {
                        token.setRevokedAt(LocalDateTime.now());
                        refreshTokenRepository.save(token);
                    }
                });
    }

    public void revokeAllActiveTokens(User user) {
        refreshTokenRepository.findByUserAndRevokedAtIsNull(user)
                .forEach(token -> {
                    token.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(token);
                });
    }

    public void rotate(User user, String refreshToken) {
        RefreshToken entity = refreshTokenRepository.findByTokenHash(hash(refreshToken))
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Refresh token has been revoked"));

        entity.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(entity);
    }

    private String hash(String tokenValue) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(tokenValue.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash token", ex);
        }
    }
}
