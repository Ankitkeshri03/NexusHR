package com.nexushr.nexushr_backend.service;

import org.springframework.stereotype.Service;

@Service
public class ReportService {

    public String exportAttendanceReport() {
        return "Attendance Report Exported Successfully";
    }

    public String exportLeaveReport() {
        return "Leave Report Exported Successfully";
    }
}