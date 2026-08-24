package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LeaveRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "Leave type is required")
        String leaveType,
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @NotNull(message = "End date is required")
        LocalDate endDate,
        @NotBlank(message = "Reason is required")
        String reason
) {
}
