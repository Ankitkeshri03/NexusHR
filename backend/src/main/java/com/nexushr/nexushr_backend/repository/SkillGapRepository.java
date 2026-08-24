package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.SkillGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {
}