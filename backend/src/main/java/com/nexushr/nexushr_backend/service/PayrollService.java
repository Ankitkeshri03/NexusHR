package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Employee;
import com.nexushr.nexushr_backend.entity.Payroll;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public Payroll createPayroll(Payroll payroll) {
        payroll.setId(null);
        validateEmployeeExists(payroll.getEmployeeId());
        normalizePayroll(payroll);

        if (payrollRepository.existsByEmployeeIdAndPayrollMonthAndPayrollYear(
                payroll.getEmployeeId(),
                payroll.getPayrollMonth(),
                payroll.getPayrollYear())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payroll already exists for employee " + payroll.getEmployeeId()
                            + " for " + payroll.getPayrollMonth() + "/" + payroll.getPayrollYear()
            );
        }

        return payrollRepository.save(payroll);
    }

    public List<Payroll> getAllPayrolls(Integer month, Integer year, String status) {
        if (month != null && year != null) {
            validateMonth(month);
            return payrollRepository.findByPayrollMonthAndPayrollYearOrderByEmployeeIdAsc(month, year);
        }

        if (status != null && !status.isBlank()) {
            return payrollRepository.findByPaymentStatusIgnoreCaseOrderByPayrollYearDescPayrollMonthDesc(status.trim());
        }

        if (year != null) {
            return payrollRepository.findByPayrollYearOrderByPayrollMonthDescEmployeeIdAsc(year);
        }

        return payrollRepository.findAll();
    }

    public Payroll getPayrollById(Long payrollId) {
        return payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payroll not found with id " + payrollId
                ));
    }

    public List<Payroll> getPayrollsByEmployee(Long employeeId) {
        validateEmployeeExists(employeeId);
        return payrollRepository.findByEmployeeIdOrderByPayrollYearDescPayrollMonthDesc(employeeId);
    }

    public Payroll getPayrollByEmployeeAndPeriod(Long employeeId, Integer month, Integer year) {
        validateEmployeeExists(employeeId);
        validateMonth(month);
        return payrollRepository.findByEmployeeIdAndPayrollMonthAndPayrollYear(employeeId, month, year)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payroll not found for employee " + employeeId + " for " + month + "/" + year
                ));
    }

    public Payroll updatePayroll(Long payrollId, Payroll payrollRequest) {
        Payroll existing = getPayrollById(payrollId);

        if (payrollRequest.getEmployeeId() == null) {
            payrollRequest.setEmployeeId(existing.getEmployeeId());
        }
        if (payrollRequest.getPayrollMonth() == null) {
            payrollRequest.setPayrollMonth(existing.getPayrollMonth());
        }
        if (payrollRequest.getPayrollYear() == null) {
            payrollRequest.setPayrollYear(existing.getPayrollYear());
        }
        if (payrollRequest.getBasicSalary() == null) {
            payrollRequest.setBasicSalary(existing.getBasicSalary());
        }

        validateEmployeeExists(payrollRequest.getEmployeeId());
        normalizePayroll(payrollRequest);

        payrollRepository.findByEmployeeIdAndPayrollMonthAndPayrollYear(
                        payrollRequest.getEmployeeId(),
                        payrollRequest.getPayrollMonth(),
                        payrollRequest.getPayrollYear()
                )
                .filter(payroll -> !payroll.getId().equals(payrollId))
                .ifPresent(payroll -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Payroll already exists for employee " + payrollRequest.getEmployeeId()
                                    + " for " + payrollRequest.getPayrollMonth() + "/" + payrollRequest.getPayrollYear()
                    );
                });

        existing.setEmployeeId(payrollRequest.getEmployeeId());
        existing.setPayrollMonth(payrollRequest.getPayrollMonth());
        existing.setPayrollYear(payrollRequest.getPayrollYear());
        existing.setBasicSalary(payrollRequest.getBasicSalary());
        existing.setAllowances(payrollRequest.getAllowances());
        existing.setDeductions(payrollRequest.getDeductions());
        existing.setBonus(payrollRequest.getBonus());
        existing.setNetSalary(payrollRequest.getNetSalary());
        existing.setPaymentStatus(payrollRequest.getPaymentStatus());
        existing.setPaymentDate(payrollRequest.getPaymentDate());
        existing.setNotes(payrollRequest.getNotes());

        return payrollRepository.save(existing);
    }

    public Payroll markAsPaid(Long payrollId, LocalDate paymentDate) {
        Payroll payroll = getPayrollById(payrollId);
        payroll.setPaymentStatus("PAID");
        payroll.setPaymentDate(paymentDate != null ? paymentDate : LocalDate.now());
        return payrollRepository.save(payroll);
    }

    public void deletePayroll(Long payrollId) {
        Payroll payroll = getPayrollById(payrollId);
        payrollRepository.delete(payroll);
    }

    private void validateEmployeeExists(Long employeeId) {
        if (employeeId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee id is required");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with id " + employeeId
                ));

        if (employee.getEmploymentStatus() != null
                && employee.getEmploymentStatus().equalsIgnoreCase("inactive")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot generate payroll for inactive employee " + employeeId
            );
        }
    }

    private void normalizePayroll(Payroll payroll) {
        validateMonth(payroll.getPayrollMonth());

        if (payroll.getPayrollYear() == null || payroll.getPayrollYear() < 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payroll year must be valid");
        }

        payroll.setBasicSalary(sanitizeAmount(payroll.getBasicSalary(), "Basic salary"));
        payroll.setAllowances(defaultAmount(payroll.getAllowances()));
        payroll.setDeductions(defaultAmount(payroll.getDeductions()));
        payroll.setBonus(defaultAmount(payroll.getBonus()));

        double netSalary = payroll.getBasicSalary() + payroll.getAllowances() + payroll.getBonus() - payroll.getDeductions();
        if (netSalary < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Net salary cannot be negative");
        }

        payroll.setNetSalary(netSalary);

        if (payroll.getPaymentStatus() == null || payroll.getPaymentStatus().isBlank()) {
            payroll.setPaymentStatus("PENDING");
        } else {
            payroll.setPaymentStatus(payroll.getPaymentStatus().trim().toUpperCase(Locale.ROOT));
        }

        if (payroll.getPaymentStatus().equals("PAID") && payroll.getPaymentDate() == null) {
            payroll.setPaymentDate(LocalDate.now());
        }

        if (!payroll.getPaymentStatus().equals("PAID")) {
            payroll.setPaymentDate(null);
        }

        if (payroll.getNotes() != null) {
            payroll.setNotes(payroll.getNotes().trim());
        }
    }

    private void validateMonth(Integer month) {
        if (month == null || month < 1 || month > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payroll month must be between 1 and 12");
        }
    }

    private Double sanitizeAmount(Double value, String fieldName) {
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }

        if (value < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " cannot be negative");
        }

        return value;
    }

    private Double defaultAmount(Double value) {
        if (value == null) {
            return 0.0;
        }

        if (value < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payroll amounts cannot be negative");
        }

        return value;
    }
}
