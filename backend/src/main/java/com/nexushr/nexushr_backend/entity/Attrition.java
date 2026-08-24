package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "attrition")
@Data
public class Attrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private String riskLevel; // Low, Medium, High

    private Double predictionScore;

    private String reason;
}