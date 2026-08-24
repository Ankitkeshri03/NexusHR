package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.SecurityToken;
import com.nexushr.nexushr_backend.entity.SecurityToken.TokenType;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.repository.SecurityTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
@Transactional
public class SecurityTokenService {

    private final SecurityTokenRepository securityTokenRepository;

    public String issueToken(User user, TokenType tokenType, LocalDateTime expiresAt) {
        securityTokenRepository.findByUserAndTokenTypeAndConsumedAtIsNull(user, tokenType)
                .forEach(existing -> {
                    existing.setConsumedAt(LocalDateTime.now());
                    securityTokenRepository.save(existing);
                });

        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        SecurityToken token = new SecurityToken();
        token.setUser(user);
        token.setTokenType(tokenType);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(expiresAt);
        securityTokenRepository.save(token);

        return rawToken;
    }

    public User consumeToken(String rawToken, TokenType tokenType) {
        SecurityToken token = securityTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Token is invalid"));

        if (token.getTokenType() != tokenType || token.getConsumedAt() != null || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(BAD_REQUEST, "Token is invalid or expired");
        }

        token.setConsumedAt(LocalDateTime.now());
        securityTokenRepository.save(token);
        return token.getUser();
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
