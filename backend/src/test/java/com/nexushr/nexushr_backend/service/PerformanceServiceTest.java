package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Performance;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.PerformanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PerformanceServiceTest {

    @Mock
    private PerformanceRepository performanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private PerformanceService performanceService;

    @BeforeEach
    void setUp() {
        performanceService = new PerformanceService(performanceRepository, employeeRepository);
    }

    @Test
    void saveCalculatesHoursAndAppliesDefaultEnums() {
        Performance performance = new Performance();
        performance.setEmployeeId(12L);
        performance.setAttendanceDate(LocalDate.of(2026, 5, 26));
        performance.setCheckInTime(LocalTime.of(9, 15));
        performance.setCheckOutTime(LocalTime.of(18, 0));

        when(employeeRepository.existsById(12L)).thenReturn(true);
        when(performanceRepository.save(any(Performance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Performance saved = performanceService.save(performance);

        assertEquals("PRESENT", saved.getAttendanceStatus());
        assertEquals("OFFICE", saved.getWorkMode());
        assertEquals(8.75, saved.getTotalHours());
    }

    @Test
    void saveRejectsCheckoutBeforeCheckin() {
        Performance performance = new Performance();
        performance.setEmployeeId(12L);
        performance.setAttendanceDate(LocalDate.of(2026, 5, 26));
        performance.setCheckInTime(LocalTime.of(17, 0));
        performance.setCheckOutTime(LocalTime.of(9, 0));

        when(employeeRepository.existsById(12L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> performanceService.save(performance)
        );

        assertEquals(400, exception.getStatusCode().value());
        assertEquals("Check-out time cannot be before check-in time", exception.getReason());
    }
}
