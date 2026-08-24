package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Department;
import com.nexushr.nexushr_backend.entity.Designation;
import com.nexushr.nexushr_backend.repository.DepartmentRepository;
import com.nexushr.nexushr_backend.repository.DesignationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DesignationServiceTest {

    @Mock
    private DesignationRepository designationRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    private DesignationService designationService;

    @BeforeEach
    void setUp() {
        designationService = new DesignationService(designationRepository, departmentRepository);
    }

    @Test
    void createDesignationRejectsDuplicatesWithinDepartment() {
        Designation designation = new Designation();
        designation.setDesignationName(" Manager ");
        designation.setDepartmentId(3L);

        Department department = new Department();
        department.setId(3L);

        when(departmentRepository.findById(3L)).thenReturn(Optional.of(department));
        when(designationRepository.existsByDesignationNameIgnoreCaseAndDepartmentId("Manager", 3L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> designationService.createDesignation(designation)
        );

        assertEquals(409, exception.getStatusCode().value());
        assertEquals("Designation already exists in this department", exception.getReason());
    }

    @Test
    void createDesignationPersistsDepartmentIdAlongsideRelation() {
        Designation designation = new Designation();
        designation.setDesignationName(" Analyst ");
        designation.setDescription("  Supports reporting ");
        designation.setDepartmentId(8L);

        Department department = new Department();
        department.setId(8L);

        when(departmentRepository.findById(8L)).thenReturn(Optional.of(department));
        when(designationRepository.existsByDesignationNameIgnoreCaseAndDepartmentId("Analyst", 8L)).thenReturn(false);
        when(designationRepository.save(any(Designation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Designation saved = designationService.createDesignation(designation);

        assertEquals("Analyst", saved.getDesignationName());
        assertEquals("Supports reporting", saved.getDescription());
        assertEquals(8L, saved.getDepartmentId());
        assertEquals(department, saved.getDepartment());
    }
}
