package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AppraisalRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "Appraisal period is required")
        String appraisalPeriod,
        @NotBlank(message = "Final rating is required")
        String finalRating,
        String salaryHike,
        String remarks
) {
}
