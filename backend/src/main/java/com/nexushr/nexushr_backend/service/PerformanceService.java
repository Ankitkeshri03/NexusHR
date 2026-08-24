package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Performance;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY");
    private static final Set<String> ALLOWED_WORK_MODES = Set.of("OFFICE", "WFH", "HYBRID");

    private final PerformanceRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<Performance> getAll() {
        return repository.findAll();
    }

    public Performance save(Performance performance) {
        performance.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, performance.getEmployeeId());
        normalizePerformance(performance);
        return repository.save(performance);
    }

    public void delete(Long id) {
        ServiceValidationUtils.validateRequiredId("Performance id", id);
        Performance performance = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Performance record not found with id " + id
                ));
        repository.delete(performance);
    }

    private void normalizePerformance(Performance performance) {
        if (performance.getAttendanceDate() == null) {
            performance.setAttendanceDate(LocalDate.now());
        }

        performance.setAttendanceStatus(ServiceValidationUtils.normalizeAllowedValueOrDefault(
                performance.getAttendanceStatus(),
                "Attendance status",
                ALLOWED_STATUSES,
                "PRESENT"
        ));
        performance.setWorkMode(ServiceValidationUtils.normalizeAllowedValueOrDefault(
                performance.getWorkMode(),
                "Work mode",
                ALLOWED_WORK_MODES,
                "OFFICE"
        ));

        if (performance.getCheckInTime() != null && performance.getCheckOutTime() != null) {
            if (performance.getCheckOutTime().isBefore(performance.getCheckInTime())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Check-out time cannot be before check-in time"
                );
            }

            Duration duration = Duration.between(performance.getCheckInTime(), performance.getCheckOutTime());
            performance.setTotalHours(
                    BigDecimal.valueOf(duration.toMinutes() / 60.0)
                            .setScale(2, RoundingMode.HALF_UP)
                            .doubleValue()
            );
        } else if (performance.getCheckOutTime() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-in time is required when check-out time is provided"
            );
        } else {
            performance.setTotalHours(null);
        }
    }
}
