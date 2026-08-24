package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.KPI;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface KPIRepository extends JpaRepository<KPI, Long> {
}