package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "company_settings")
@Data
public class CompanySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String companyName = "NexusHR";

    @Column(nullable = false, length = 150)
    private String companyEmail = "contact@nexushr.com";

    @Column(length = 30)
    private String companyPhone;

    @Column(length = 250)
    private String address;

    @Column(length = 150)
    private String website;

    @Column(length = 100)
    private String taxId;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
