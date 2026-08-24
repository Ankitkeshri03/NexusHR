package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.LeaveRequestDTO;
import com.nexushr.nexushr_backend.dto.LeaveStatusUpdateRequestDTO;
import com.nexushr.nexushr_backend.entity.Leave;
import com.nexushr.nexushr_backend.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Leave createLeave(@Valid @RequestBody LeaveRequestDTO request) {
        return leaveService.applyLeave(toEntity(request));
    }

    @PostMapping("/apply")
    @PreAuthorize("isAuthenticated()")
    public Leave applyLeave(@Valid @RequestBody LeaveRequestDTO request) {
        return leaveService.applyLeave(toEntity(request));
    }

    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

    @GetMapping("/employee/{employeeId}")
    public List<Leave> getLeavesByEmployee(@PathVariable Long employeeId) {
        return leaveService.getLeavesByEmployee(employeeId);
    }

    @PutMapping("/{leaveId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Leave updateStatus(@PathVariable Long leaveId,
                              @Valid @RequestBody LeaveStatusUpdateRequestDTO request) {
        return leaveService.updateApprovalStatus(leaveId, request.status(), request.approvedBy());
    }

    @PutMapping("/approve/{leaveId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Leave approveLeave(
            @PathVariable Long leaveId,
            @RequestParam Long approvedBy) {

        return leaveService.approveLeave(leaveId, approvedBy);
    }

    @PutMapping("/reject/{leaveId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Leave rejectLeave(
            @PathVariable Long leaveId,
            @RequestParam Long approvedBy) {

        return leaveService.rejectLeave(leaveId, approvedBy);
    }

    private Leave toEntity(LeaveRequestDTO request) {
        Leave leave = new Leave();
        leave.setEmployeeId(request.employeeId());
        leave.setLeaveType(request.leaveType());
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason());
        return leave;
    }
}
