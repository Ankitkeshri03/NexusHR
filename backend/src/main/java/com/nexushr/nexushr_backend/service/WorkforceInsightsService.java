package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.WorkforceInsights;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.WorkforceInsightsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WorkforceInsightsService {

    private static final Set<String> ALLOWED_PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");

    private final WorkforceInsightsRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<WorkforceInsights> getAll() {
        return repository.findAll();
    }

    public WorkforceInsights save(WorkforceInsights insight) {
        insight.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, insight.getEmployeeId());
        normalizeInsight(insight);
        return repository.save(insight);
    }

    public void delete(Long id) {
        ServiceValidationUtils.validateRequiredId("Workforce insight id", id);
        WorkforceInsights insight = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Workforce insight not found with id " + id
                ));
        repository.delete(insight);
    }

    private void normalizeInsight(WorkforceInsights insight) {
        insight.setRecommendationType(
                ServiceValidationUtils.normalizeRequiredText(
                        insight.getRecommendationType(),
                        "Recommendation type"
                )
        );
        insight.setRecommendation(
                ServiceValidationUtils.normalizeRequiredText(insight.getRecommendation(), "Recommendation")
        );
        insight.setPriority(ServiceValidationUtils.normalizeAllowedValue(
                insight.getPriority(),
                "Priority",
                ALLOWED_PRIORITIES
        ));
    }
}
