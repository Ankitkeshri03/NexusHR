package com.nexushr.nexushr_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequestDTO {

    @NotBlank(message = "Employee code required")
    private String employeeCode;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "First name required")
    private String firstName;

    @NotBlank(message = "Last name required")
    private String lastName;

    @NotBlank(message = "Email required")
    @Email(message = "Valid email chahiye")
    private String email;

    @Min(value = 18, message = "Age must be at least 18")
    private Integer age;

    private String phoneNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private LocalDate joiningDate;
    private Long departmentId;
    private Long designationId;
    private Long managerId;
    private String employmentStatus;
    private String profileImage;
    private String image;
    private String employmentType;
    private Double salary;
}
