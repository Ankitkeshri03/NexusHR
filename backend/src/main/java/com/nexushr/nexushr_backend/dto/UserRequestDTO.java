package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequestDTO(
        @NotBlank(message = "Username is required")
        String username,
        String fullName,
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,
        String password,
        String phoneNumber,
        String designation,
        String status,
        Boolean emailVerified
) {
}
