package com.nexushr.nexushr_backend.dto;

import lombok.Builder;

@Builder
public record SettingsProfileDTO(
        Long id,
        String username,
        String fullName,
        String email,
        String phoneNumber,
        String designation,
        String status,
        boolean emailVerified
) {
}
