package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Attrition;
import com.nexushr.nexushr_backend.repository.AttritionRepository;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttritionServiceTest {

    @Mock
    private AttritionRepository attritionRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private AttritionService attritionService;

    @BeforeEach
    void setUp() {
        attritionService = new AttritionService(attritionRepository, employeeRepository);
    }

    @Test
    void saveRejectsUnknownEmployees() {
        Attrition attrition = new Attrition();
        attrition.setEmployeeId(44L);
        attrition.setRiskLevel("high");
        attrition.setPredictionScore(92.0);

        when(employeeRepository.existsById(44L)).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> attritionService.save(attrition)
        );

        assertEquals(404, exception.getStatusCode().value());
        assertEquals("Employee not found with id 44", exception.getReason());
    }

    @Test
    void saveRejectsOutOfRangePredictionScores() {
        Attrition attrition = new Attrition();
        attrition.setEmployeeId(5L);
        attrition.setRiskLevel("high");
        attrition.setPredictionScore(120.0);

        when(employeeRepository.existsById(5L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> attritionService.save(attrition)
        );

        assertEquals(400, exception.getStatusCode().value());
        assertEquals("Prediction score must be between 0.0 and 100.0", exception.getReason());
    }
}
