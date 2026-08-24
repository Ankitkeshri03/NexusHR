package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {
}