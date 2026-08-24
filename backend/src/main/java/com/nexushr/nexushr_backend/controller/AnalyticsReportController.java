package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.service.AnalyticsReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin("*")
public class AnalyticsReportController {

    @Autowired
    private AnalyticsReportService analyticsReportService;

    @GetMapping("/employee-growth")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getEmployeeGrowth() {
        return analyticsReportService.getEmployeeGrowth();
    }
}
