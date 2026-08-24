package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WorkforceInsightsRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "Recommendation type is required")
        String recommendationType,
        @NotBlank(message = "Recommendation is required")
        String recommendation,
        @NotBlank(message = "Priority is required")
        String priority
) {
}
