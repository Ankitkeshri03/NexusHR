package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Leave;
import com.nexushr.nexushr_backend.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;

    public Leave applyLeave(Leave leave) {
        leave.setId(null);
        normalizeLeave(leave);
        leave.setApprovalStatus("PENDING");
        leave.setCreatedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public List<Leave> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    public Leave approveLeave(Long leaveId, Long approvedBy) {
        return updateApprovalStatus(leaveId, "APPROVED", approvedBy);
    }

    public Leave rejectLeave(Long leaveId, Long approvedBy) {
        return updateApprovalStatus(leaveId, "REJECTED", approvedBy);
    }

    public Leave updateApprovalStatus(Long leaveId, String status, Long approvedBy) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave not found"));

        if (approvedBy == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approved by is required");
        }

        String normalizedStatus = normalizeStatus(status);
        leave.setApprovalStatus(normalizedStatus);
        leave.setApprovedBy(approvedBy);

        return leaveRepository.save(leave);
    }

    private void normalizeLeave(Leave leave) {
        if (leave.getEmployeeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee id is required");
        }

        if (leave.getStartDate() == null) {
            leave.setStartDate(LocalDate.now());
        }

        if (leave.getEndDate() == null) {
            leave.setEndDate(leave.getStartDate());
        }

        if (leave.getEndDate().isBefore(leave.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
        }

        if (leave.getLeaveType() != null) {
            leave.setLeaveType(leave.getLeaveType().trim());
        }

        if (leave.getReason() != null) {
            leave.setReason(leave.getReason().trim());
        }
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "PENDING", "APPROVED", "REJECTED" -> normalized;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported leave status");
        };
    }
}
