package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Department;
import com.nexushr.nexushr_backend.repository.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    private DepartmentService departmentService;

    @BeforeEach
    void setUp() {
        departmentService = new DepartmentService(departmentRepository);
    }

    @Test
    void createDepartmentRejectsDuplicateNameAfterNormalization() {
        Department department = new Department();
        department.setDepartmentName("  Finance  ");

        when(departmentRepository.existsByDepartmentNameIgnoreCase("Finance")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> departmentService.createDepartment(department)
        );

        assertEquals(409, exception.getStatusCode().value());
        assertEquals("Department already exists", exception.getReason());
    }

    @Test
    void createDepartmentNormalizesTrimmedValuesBeforeSave() {
        Department department = new Department();
        department.setDepartmentName("  People Ops  ");
        department.setDescription("   ");

        when(departmentRepository.existsByDepartmentNameIgnoreCase("People Ops")).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Department saved = departmentService.createDepartment(department);

        assertEquals("People Ops", saved.getDepartmentName());
        assertNull(saved.getDescription());
        verify(departmentRepository).save(department);
    }
}
