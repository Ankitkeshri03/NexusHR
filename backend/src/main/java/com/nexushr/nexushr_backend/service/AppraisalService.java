package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Appraisal;
import com.nexushr.nexushr_backend.repository.AppraisalRepository;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppraisalService {

    private final AppraisalRepository repository;
    private final EmployeeRepository employeeRepository;

    public List<Appraisal> getAll() {
        return repository.findAll();
    }

    public Appraisal save(Appraisal appraisal) {
        appraisal.setId(null);
        ServiceValidationUtils.validateEmployeeExists(employeeRepository, appraisal.getEmployeeId());
        normalizeAppraisal(appraisal);
        return repository.save(appraisal);
    }

    private void normalizeAppraisal(Appraisal appraisal) {
        appraisal.setAppraisalPeriod(
                ServiceValidationUtils.normalizeRequiredText(appraisal.getAppraisalPeriod(), "Appraisal period")
        );
        appraisal.setFinalRating(
                ServiceValidationUtils.normalizeRequiredText(appraisal.getFinalRating(), "Final rating")
        );
        appraisal.setSalaryHike(ServiceValidationUtils.normalizeOptionalText(appraisal.getSalaryHike()));
        appraisal.setRemarks(ServiceValidationUtils.normalizeOptionalText(appraisal.getRemarks()));
    }
}
