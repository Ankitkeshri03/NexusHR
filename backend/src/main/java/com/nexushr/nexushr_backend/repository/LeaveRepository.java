package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long>
{
    List<Leave> findByEmployeeId(Long employeeId);
}