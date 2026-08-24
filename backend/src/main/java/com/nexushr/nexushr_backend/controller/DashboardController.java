package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.DashboardSummaryDTO;
import com.nexushr.nexushr_backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public DashboardSummaryDTO getDashboardSummary()
    {
        return dashboardService.getDashboardSummary();
    }
}
