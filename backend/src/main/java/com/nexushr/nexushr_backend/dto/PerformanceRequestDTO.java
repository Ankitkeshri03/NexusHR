package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record PerformanceRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotNull(message = "Attendance date is required")
        LocalDate attendanceDate,
        LocalTime checkInTime,
        LocalTime checkOutTime,
        String attendanceStatus,
        String workMode
) {
}
