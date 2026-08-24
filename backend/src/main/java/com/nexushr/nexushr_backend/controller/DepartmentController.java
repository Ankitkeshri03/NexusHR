package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.DepartmentRequestDTO;
import com.nexushr.nexushr_backend.entity.Department;
import com.nexushr.nexushr_backend.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Department create(@Valid @RequestBody DepartmentRequestDTO request) {
        return departmentService.createDepartment(toEntity(request));
    }

    @GetMapping
    public List<Department> getAll() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    public Department getById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Department update(@PathVariable Long id,
                             @Valid @RequestBody DepartmentRequestDTO request) {
        return departmentService.updateDepartment(id, toEntity(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return "Department deleted successfully";
    }

    private Department toEntity(DepartmentRequestDTO request) {
        Department department = new Department();
        department.setDepartmentName(request.departmentName());
        department.setDescription(request.description());
        department.setDepartmentHead(request.departmentHead());
        department.setBudget(request.budget());
        department.setStatus(request.status());
        return department;
    }
}
