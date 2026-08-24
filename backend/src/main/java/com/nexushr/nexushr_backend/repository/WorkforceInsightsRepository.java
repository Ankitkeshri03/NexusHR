package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.WorkforceInsights;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkforceInsightsRepository extends JpaRepository<WorkforceInsights, Long> {
}