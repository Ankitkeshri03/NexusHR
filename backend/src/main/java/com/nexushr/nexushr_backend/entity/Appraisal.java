package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "appraisal")
public class Appraisal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String appraisalPeriod;
    private String finalRating;
    private String salaryHike;
    private String remarks;
}