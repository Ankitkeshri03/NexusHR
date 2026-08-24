package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequestDTO {

    @NotBlank
    private String username;

    private String fullName;

    @Email
    @NotBlank
    private String email;

    private String phoneNumber;
    private String designation;
}
