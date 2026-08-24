package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record KPIRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "KPI name is required")
        String kpiName,
        String targetValue,
        String achievedValue,
        String status
) {
}
