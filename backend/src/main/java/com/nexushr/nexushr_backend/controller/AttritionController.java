package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.AttritionRequestDTO;
import com.nexushr.nexushr_backend.entity.Attrition;
import com.nexushr.nexushr_backend.service.AttritionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attrition")
@CrossOrigin("*")
public class AttritionController {

    @Autowired
    private AttritionService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Attrition> getAll() {
        return service.getAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Attrition create(@Valid @RequestBody AttritionRequestDTO request) {
        return service.save(toEntity(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private Attrition toEntity(AttritionRequestDTO request) {
        Attrition attrition = new Attrition();
        attrition.setEmployeeId(request.employeeId());
        attrition.setRiskLevel(request.riskLevel());
        attrition.setPredictionScore(request.predictionScore());
        attrition.setReason(request.reason());
        return attrition;
    }
}
