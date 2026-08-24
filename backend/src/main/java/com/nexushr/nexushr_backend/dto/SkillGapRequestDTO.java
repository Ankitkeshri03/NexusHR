package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SkillGapRequestDTO(
        @NotNull(message = "Employee id is required")
        Long employeeId,
        @NotBlank(message = "Current skill is required")
        String currentSkill,
        @NotBlank(message = "Required skill is required")
        String requiredSkill,
        @NotBlank(message = "Gap level is required")
        String gapLevel
) {
}
