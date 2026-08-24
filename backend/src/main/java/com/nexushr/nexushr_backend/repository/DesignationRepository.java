package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    boolean existsByDesignationNameIgnoreCaseAndDepartmentId(String designationName, Long departmentId);

    boolean existsByDesignationNameIgnoreCaseAndDepartmentIdAndIdNot(String designationName, Long departmentId, Long id);
}
