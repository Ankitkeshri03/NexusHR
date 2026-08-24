package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.SecurityToken;
import com.nexushr.nexushr_backend.entity.SecurityToken.TokenType;
import com.nexushr.nexushr_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SecurityTokenRepository extends JpaRepository<SecurityToken, Long> {
    Optional<SecurityToken> findByTokenHash(String tokenHash);
    List<SecurityToken> findByUserAndTokenTypeAndConsumedAtIsNull(User user, TokenType tokenType);
}
