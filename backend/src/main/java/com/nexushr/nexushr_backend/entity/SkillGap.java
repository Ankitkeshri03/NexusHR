package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "skill_gap")
@Data
public class SkillGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private String currentSkill;

    private String requiredSkill;

    private String gapLevel;
}