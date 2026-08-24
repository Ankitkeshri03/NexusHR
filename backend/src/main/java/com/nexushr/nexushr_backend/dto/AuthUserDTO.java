package com.nexushr.nexushr_backend.dto;

import lombok.Builder;

import java.util.Set;

@Builder
public record AuthUserDTO(
        Long id,
        String username,
        String email,
        String status,
        Set<String> roles,
        boolean firstLogin
) {
}
