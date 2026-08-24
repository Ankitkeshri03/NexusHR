package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Department;
import com.nexushr.nexushr_backend.entity.Designation;
import com.nexushr.nexushr_backend.repository.DepartmentRepository;
import com.nexushr.nexushr_backend.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignationService {

    // Repository for Designation table operations
    private final DesignationRepository designationRepository;

    // Repository for Department table operations
    private final DepartmentRepository departmentRepository;


    /**
     * Create new designation
     */
    public Designation createDesignation(Designation request) {
        request.setId(null);
        normalizeDesignation(request);
        Department department = getDepartment(request.getDepartmentId());
        ensureDesignationIsUnique(request.getDesignationName(), request.getDepartmentId(), null);

        // Create new designation object
        Designation designation = new Designation();

        // Set designation details
        designation.setDesignationName(request.getDesignationName());
        designation.setDesignationCode(request.getDesignationCode());
        designation.setDescription(request.getDescription());
        designation.setLevel(request.getLevel());
        designation.setSalaryRangeMin(request.getSalaryRangeMin());
        designation.setSalaryRangeMax(request.getSalaryRangeMax());
        designation.setStatus(request.getStatus());
        designation.setDepartmentId(request.getDepartmentId());

        // Link department with designation
        designation.setDepartment(department);

        // Save designation into database
        return designationRepository.save(designation);
    }


    /**
     * Get all designations
     */
    public List<Designation> getAllDesignations() {
        return designationRepository.findAll();
    }


    /**
     * Get designation by ID
     */
    public Designation getDesignationById(Long id) {
        ServiceValidationUtils.validateRequiredId("Designation id", id);
        return designationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Designation not found with id: " + id
                ));
    }


    /**
     * Update designation details
     */
    public Designation updateDesignation(Long id, Designation request) {

        // Find existing designation
        Designation existing = getDesignationById(id);
        normalizeDesignation(request);
        ensureDesignationIsUnique(request.getDesignationName(), request.getDepartmentId(), id);

        // Find department
        Department department = getDepartment(request.getDepartmentId());

        // Update designation details
        existing.setDesignationName(request.getDesignationName());
        existing.setDescription(request.getDescription());
        existing.setDepartmentId(request.getDepartmentId());
        existing.setDesignationCode(request.getDesignationCode());
        existing.setLevel(request.getLevel());
        existing.setSalaryRangeMin(request.getSalaryRangeMin());
        existing.setSalaryRangeMax(request.getSalaryRangeMax());
        existing.setStatus(request.getStatus());
        // Update department mapping
        existing.setDepartment(department);

        // Save updated designation
        return designationRepository.save(existing);
    }


    /**
     * Delete designation by ID
     */
    public void deleteDesignation(Long id) {

        // Find designation first
        Designation designation = getDesignationById(id);

        // Delete designation
        designationRepository.delete(designation);
    }

    private Department getDepartment(Long departmentId) {
        ServiceValidationUtils.validateRequiredId("Department id", departmentId);
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found with id: " + departmentId
                ));
    }

    private void ensureDesignationIsUnique(String designationName, Long departmentId, Long currentId) {
        boolean exists = currentId == null
                ? designationRepository.existsByDesignationNameIgnoreCaseAndDepartmentId(designationName, departmentId)
                : designationRepository.existsByDesignationNameIgnoreCaseAndDepartmentIdAndIdNot(
                        designationName,
                        departmentId,
                        currentId
                );
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Designation already exists in this department");
        }
    }

    private void normalizeDesignation(Designation designation) {
        designation.setDesignationName(
                ServiceValidationUtils.normalizeRequiredText(designation.getDesignationName(), "Designation name")
        );
        designation.setDescription(ServiceValidationUtils.normalizeOptionalText(designation.getDescription()));
        ServiceValidationUtils.validateRequiredId("Department id", designation.getDepartmentId());
    }
}
