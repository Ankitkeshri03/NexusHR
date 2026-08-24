package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GoalRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "Goal title is required")
        String goalTitle,
        String description,
        String deadline,
        String status
) {
}
