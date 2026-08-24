package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequestDTO(
        @NotBlank(message = "Department name is required")
        String departmentName,
        String departmentHead,
        Double budget,
        String status,
        String description
) {
}
