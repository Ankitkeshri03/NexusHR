package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
}