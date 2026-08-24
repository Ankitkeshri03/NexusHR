package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequestDTO(
        @NotNull(message = "User id is required")
        Long userId,
        @NotBlank(message = "Notification title is required")
        String notificationTitle,
        String notificationMessage,
        String notificationType
) {
}
