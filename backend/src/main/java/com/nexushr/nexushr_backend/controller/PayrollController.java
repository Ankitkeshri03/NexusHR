package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.PayrollRequestDTO;
import com.nexushr.nexushr_backend.entity.Payroll;
import com.nexushr.nexushr_backend.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/payrolls", "/api/payroll"})
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payroll> createPayroll(@Valid @RequestBody PayrollRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.createPayroll(toEntity(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payroll>> getAllPayrolls(@RequestParam(required = false) Integer month,
                                                        @RequestParam(required = false) Integer year,
                                                        @RequestParam(required = false) String status) {
        return ResponseEntity.ok(payrollService.getAllPayrolls(month, year, status));
    }

    @GetMapping("/{payrollId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long payrollId) {
        return ResponseEntity.ok(payrollService.getPayrollById(payrollId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payroll>> getPayrollsByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollsByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/period")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payroll> getPayrollByEmployeeAndPeriod(@PathVariable Long employeeId,
                                                                 @RequestParam Integer month,
                                                                 @RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployeeAndPeriod(employeeId, month, year));
    }

    @PutMapping("/{payrollId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long payrollId,
                                                 @Valid @RequestBody PayrollRequestDTO request) {
        return ResponseEntity.ok(payrollService.updatePayroll(payrollId, toEntity(request)));
    }

    @PatchMapping("/{payrollId}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payroll> markPayrollAsPaid(@PathVariable Long payrollId,
                                                     @RequestParam(required = false) LocalDate paymentDate) {
        return ResponseEntity.ok(payrollService.markAsPaid(payrollId, paymentDate));
    }

    @DeleteMapping("/{payrollId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long payrollId) {
        payrollService.deletePayroll(payrollId);
        return ResponseEntity.noContent().build();
    }

    private Payroll toEntity(PayrollRequestDTO request) {
        Payroll payroll = new Payroll();
        payroll.setEmployeeId(request.employeeId());
        payroll.setPayrollMonth(request.payrollMonth());
        payroll.setPayrollYear(request.payrollYear());
        payroll.setBasicSalary(request.basicSalary());
        payroll.setAllowances(request.allowances());
        payroll.setDeductions(request.deductions());
        payroll.setBonus(request.bonus());
        payroll.setPaymentStatus(request.paymentStatus());
        payroll.setPaymentDate(request.paymentDate());
        payroll.setNotes(request.notes());
        return payroll;
    }
}
