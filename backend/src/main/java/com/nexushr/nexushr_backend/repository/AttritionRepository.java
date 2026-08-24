package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Attrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttritionRepository extends JpaRepository<Attrition, Long> {
}