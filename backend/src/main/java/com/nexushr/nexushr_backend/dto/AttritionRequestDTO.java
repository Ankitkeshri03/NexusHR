package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record AttritionRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "Risk level is required")
        String riskLevel,
        @NotNull(message = "Prediction score is required")
        @PositiveOrZero(message = "Prediction score cannot be negative")
        Double predictionScore,
        String reason
) {
}
