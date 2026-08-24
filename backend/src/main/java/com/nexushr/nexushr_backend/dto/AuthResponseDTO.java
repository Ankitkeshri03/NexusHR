package com.nexushr.nexushr_backend.dto;

import lombok.Builder;

@Builder
public record AuthResponseDTO(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        AuthUserDTO user
) {
}
