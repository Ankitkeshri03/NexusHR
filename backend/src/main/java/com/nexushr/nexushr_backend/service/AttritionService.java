package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Attrition;
import com.nexushr.nexushr_backend.repository.AttritionRepository;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AttritionService {

    private static final Set<String> ALLOWED_RISK_LEVELS = Set.of("LOW", "MEDIUM", "HIGH");

    private final AttritionRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<Attrition> getAll() {
        return repository.findAll();
    }

    public Attrition save(Attrition attrition) {
        attrition.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, attrition.getEmployeeId());
        normalizeAttrition(attrition);
        return repository.save(attrition);
    }

    public Attrition getById(Long id) {
        ServiceValidationUtils.validateRequiredId("Attrition id", id);
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attrition record not found with id " + id
                ));
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }

    private void normalizeAttrition(Attrition attrition) {
        attrition.setRiskLevel(ServiceValidationUtils.normalizeAllowedValue(
                attrition.getRiskLevel(),
                "Risk level",
                ALLOWED_RISK_LEVELS
        ));
        ServiceValidationUtils.validateRange("Prediction score", attrition.getPredictionScore(), 0, 100);
        attrition.setReason(ServiceValidationUtils.normalizeOptionalText(attrition.getReason()));
    }
}
