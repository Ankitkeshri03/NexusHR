package com.nexushr.nexushr_backend.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record RecentEmployeeDTO(
        Long id,
        String name,
        String department,
        String status,
        LocalDate joined
) {
}
