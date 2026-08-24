package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotNull;

public record TransferEmployeeRequestDTO(
        @NotNull(message = "Department id is required")
        Long departmentId
) {
}
