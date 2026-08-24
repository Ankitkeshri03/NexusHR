package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.DesignationRequestDTO;
import com.nexushr.nexushr_backend.entity.Designation;
import com.nexushr.nexushr_backend.service.DesignationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationService designationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Designation create(@Valid @RequestBody DesignationRequestDTO request) {
        return designationService.createDesignation(toEntity(request));
    }

    @GetMapping
    public List<Designation> getAll() {
        return designationService.getAllDesignations();
    }

    @GetMapping("/{id}")
    public Designation getById(@PathVariable Long id) {
        return designationService.getDesignationById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Designation update(@PathVariable Long id,
                              @Valid @RequestBody DesignationRequestDTO request) {

        return designationService.updateDesignation(id, toEntity(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {

        designationService.deleteDesignation(id);

        return "Designation deleted successfully";
    }

    private Designation toEntity(DesignationRequestDTO request) {
        Designation designation = new Designation();
        designation.setDesignationName(request.designationName());
        designation.setDesignationCode(request.designationCode());
        designation.setDescription(request.description());
        designation.setDepartmentId(request.departmentId());
        designation.setLevel(request.level());
        designation.setSalaryRangeMin(request.salaryRangeMin());
        designation.setSalaryRangeMax(request.salaryRangeMax());
        designation.setStatus(request.status());
        return designation;
    }
}
