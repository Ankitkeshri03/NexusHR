package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CompanySettingsDTO(
        Long id,
        @NotBlank String companyName,
        @Email @NotBlank String companyEmail,
        String companyPhone,
        String address,
        String website,
        String taxId
) {
}
