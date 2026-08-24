package com.nexushr.nexushr_backend.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DesignationRequestDTO(
        @NotBlank(message = "Designation name is required")
        String designationName,
        String designationCode,
        String level,
        String description,
        @NotNull(message = "Department id is required")
        Long departmentId,
        @Min(value = 0, message = "Minimum salary cannot be negative")
        Double salaryRangeMin,

        @Min(value = 0, message = "Maximum salary cannot be negative")
        Double salaryRangeMax,

        @NotNull(message = "Status is required")
        String status
        ) {
}
