package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LeaveStatusUpdateRequestDTO(
        @NotBlank(message = "Status is required")
        String status,
        @NotNull(message = "Approved by is required")
        Long approvedBy
) {
}
