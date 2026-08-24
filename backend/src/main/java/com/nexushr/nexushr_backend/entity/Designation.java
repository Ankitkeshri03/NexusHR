package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "designations")
public class Designation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String designationName;
    private String designationCode;
    private String description;
    private String level;
    private Double salaryRangeMin;
    private Double salaryRangeMax;
    private String status;

    @ManyToOne
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @Column(name = "department_id")
    private Long departmentId; // ← This is what getDepartmentId() needs
}