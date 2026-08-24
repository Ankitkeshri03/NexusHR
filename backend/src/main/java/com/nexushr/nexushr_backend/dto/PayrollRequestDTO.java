package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record PayrollRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotNull(message = "Payroll month is required")
        @Min(value = 1, message = "Payroll month must be between 1 and 12")
        @Max(value = 12, message = "Payroll month must be between 1 and 12")
        Integer payrollMonth,
        @NotNull(message = "Payroll year is required")
        @Min(value = 2000, message = "Payroll year must be valid")
        Integer payrollYear,
        @NotNull(message = "Basic salary is required")
        @PositiveOrZero(message = "Basic salary cannot be negative")
        Double basicSalary,
        @PositiveOrZero(message = "Allowances cannot be negative")
        Double allowances,
        @PositiveOrZero(message = "Deductions cannot be negative")
        Double deductions,
        @PositiveOrZero(message = "Bonus cannot be negative")
        Double bonus,
        String paymentStatus,
        LocalDate paymentDate,
        String notes
) {
}
