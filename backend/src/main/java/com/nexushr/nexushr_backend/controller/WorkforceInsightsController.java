package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.WorkforceInsightsRequestDTO;
import com.nexushr.nexushr_backend.entity.WorkforceInsights;
import com.nexushr.nexushr_backend.service.WorkforceInsightsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workforce-insights")
@CrossOrigin("*")
public class WorkforceInsightsController {

    @Autowired
    private WorkforceInsightsService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<WorkforceInsights> getAll() {
        return service.getAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public WorkforceInsights create(@Valid @RequestBody WorkforceInsightsRequestDTO request) {
        return service.save(toEntity(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private WorkforceInsights toEntity(WorkforceInsightsRequestDTO request) {
        WorkforceInsights insight = new WorkforceInsights();
        insight.setEmployeeId(request.employeeId());
        insight.setRecommendationType(request.recommendationType());
        insight.setRecommendation(request.recommendation());
        insight.setPriority(request.priority());
        return insight;
    }
}
