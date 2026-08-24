package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        LocalDate attendanceDate,
        LocalTime checkInTime,
        LocalTime checkOutTime,
        String attendanceStatus,
        String workMode
) {
}
