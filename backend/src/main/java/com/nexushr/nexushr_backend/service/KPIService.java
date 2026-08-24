package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.repository.KPIRepository;
import com.nexushr.nexushr_backend.entity.KPI;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KPIService {

    private final KPIRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<KPI> getAll() {
        return repository.findAll();
    }

    public KPI save(KPI kpi) {
        kpi.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, kpi.getEmployeeId());
        normalizeKpi(kpi);
        return repository.save(kpi);
    }

    private void normalizeKpi(KPI kpi) {
        kpi.setKpiName(ServiceValidationUtils.normalizeRequiredText(kpi.getKpiName(), "KPI name"));
        kpi.setTargetValue(ServiceValidationUtils.normalizeOptionalText(kpi.getTargetValue()));
        kpi.setAchievedValue(ServiceValidationUtils.normalizeOptionalText(kpi.getAchievedValue()));
        kpi.setStatus(ServiceValidationUtils.normalizeUppercaseOptional(kpi.getStatus()));
    }
}
