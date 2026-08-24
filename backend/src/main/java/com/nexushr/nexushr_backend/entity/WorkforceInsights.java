package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "workforce_insights")
@Data
public class WorkforceInsights {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private String recommendationType;

    private String recommendation;

    private String priority;
}