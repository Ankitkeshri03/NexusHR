package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}