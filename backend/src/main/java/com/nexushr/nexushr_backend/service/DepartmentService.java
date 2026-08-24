package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Department;
import com.nexushr.nexushr_backend.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public Department createDepartment(Department department) {
        department.setId(null);
        normalizeDepartment(department);
        if (departmentRepository.existsByDepartmentNameIgnoreCase(department.getDepartmentName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department already exists");
        }
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        ServiceValidationUtils.validateRequiredId("Department id", id);
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found with id: " + id
                ));
    }

    public Department updateDepartment(Long id, Department request) {
        Department existing = getDepartmentById(id);
        normalizeDepartment(request);
        if (departmentRepository.existsByDepartmentNameIgnoreCaseAndIdNot(request.getDepartmentName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department already exists");
        }
        existing.setDepartmentName(request.getDepartmentName());
        existing.setDescription(request.getDescription());
        existing.setDepartmentHead(request.getDepartmentHead());
        existing.setBudget(request.getBudget());
        existing.setStatus(request.getStatus());
        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);
        departmentRepository.delete(department);
    }

    private void normalizeDepartment(Department department) {
        department.setDepartmentName(
                ServiceValidationUtils.normalizeRequiredText(department.getDepartmentName(), "Department name")
        );
        department.setDescription(ServiceValidationUtils.normalizeOptionalText(department.getDescription()));
        department.setDepartmentHead(ServiceValidationUtils.normalizeOptionalText(department.getDepartmentHead()));
        department.setStatus(ServiceValidationUtils.normalizeOptionalText(department.getStatus()));
    }
}
