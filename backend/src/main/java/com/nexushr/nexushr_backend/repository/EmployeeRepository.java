package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCodeAndIdNot(String employeeCode, Long id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Employee> findByDepartmentId(Long departmentId);

    List<Employee> findByEmploymentStatusIgnoreCase(String employmentStatus);

    List<Employee> findByDepartmentIdAndEmploymentStatusIgnoreCase(Long departmentId, String employmentStatus);
}
