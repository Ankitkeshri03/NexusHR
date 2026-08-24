package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogoutRequestDTO {

    @NotBlank
    private String refreshToken;
}
