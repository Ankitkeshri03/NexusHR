package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record PermissionRequestDTO(
        @NotBlank(message = "Permission name is required")
        String permissionName,
        String description
) {
}
