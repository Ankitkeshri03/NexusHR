package com.nexushr.nexushr_backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsReportService {

    public Map<String, Object> getEmployeeGrowth() {
        Map<String, Object> data = new HashMap<>();

        data.put("January", 100);
        data.put("February", 120);
        data.put("March", 140);
        data.put("April", 150);

        return data;
    }
}