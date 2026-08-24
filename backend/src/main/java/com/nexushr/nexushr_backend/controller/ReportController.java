package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public String exportAttendanceReport() {
        return reportService.exportAttendanceReport();
    }

    @GetMapping("/leave")
    @PreAuthorize("hasRole('ADMIN')")
    public String exportLeaveReport() {
        return reportService.exportLeaveReport();
    }
}
