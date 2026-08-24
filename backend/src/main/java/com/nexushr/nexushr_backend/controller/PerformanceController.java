package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.PerformanceRequestDTO;
import com.nexushr.nexushr_backend.entity.Performance;
import com.nexushr.nexushr_backend.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService service;

    @GetMapping
    public List<Performance> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Performance create(@Valid @RequestBody PerformanceRequestDTO request) {
        return service.save(toEntity(request));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private Performance toEntity(PerformanceRequestDTO request) {
        Performance performance = new Performance();
        performance.setEmployeeId(request.employeeId());
        performance.setAttendanceDate(request.attendanceDate());
        performance.setCheckInTime(request.checkInTime());
        performance.setCheckOutTime(request.checkOutTime());
        performance.setAttendanceStatus(request.attendanceStatus());
        performance.setWorkMode(request.workMode());
        return performance;
    }
}
