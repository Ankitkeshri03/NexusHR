package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.KPIRequestDTO;
import com.nexushr.nexushr_backend.entity.KPI;
import com.nexushr.nexushr_backend.service.KPIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kpi")
public class KPIController {

    @Autowired
    private KPIService service;

    @GetMapping
    public List<KPI> getAll() {
        return service.getAll();
    }

    @PostMapping
    public KPI save(@Valid @RequestBody KPIRequestDTO request) {
        return service.save(toEntity(request));
    }

    private KPI toEntity(KPIRequestDTO request) {
        KPI kpi = new KPI();
        kpi.setEmployeeId(request.employeeId());
        kpi.setKpiName(request.kpiName());
        kpi.setTargetValue(request.targetValue());
        kpi.setAchievedValue(request.achievedValue());
        kpi.setStatus(request.status());
        return kpi;
    }
}
