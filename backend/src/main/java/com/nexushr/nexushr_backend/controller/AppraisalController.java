package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.AppraisalRequestDTO;
import com.nexushr.nexushr_backend.entity.Appraisal;
import com.nexushr.nexushr_backend.service.AppraisalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appraisal")
public class AppraisalController {

    @Autowired
    private AppraisalService service;

    @GetMapping
    public List<Appraisal> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Appraisal save(@Valid @RequestBody AppraisalRequestDTO request) {
        return service.save(toEntity(request));
    }

    private Appraisal toEntity(AppraisalRequestDTO request) {
        Appraisal appraisal = new Appraisal();
        appraisal.setEmployeeId(request.employeeId());
        appraisal.setAppraisalPeriod(request.appraisalPeriod());
        appraisal.setFinalRating(request.finalRating());
        appraisal.setSalaryHike(request.salaryHike());
        appraisal.setRemarks(request.remarks());
        return appraisal;
    }
}
