package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_name", nullable = false)
    private String departmentName;
    private String description;
    private String departmentHead;
    private Double budget;
    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();
}