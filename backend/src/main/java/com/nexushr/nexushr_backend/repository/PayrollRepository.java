package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    boolean existsByEmployeeIdAndPayrollMonthAndPayrollYear(Long employeeId, Integer payrollMonth, Integer payrollYear);

    Optional<Payroll> findByEmployeeIdAndPayrollMonthAndPayrollYear(Long employeeId, Integer payrollMonth, Integer payrollYear);

    List<Payroll> findByEmployeeIdOrderByPayrollYearDescPayrollMonthDesc(Long employeeId);

    List<Payroll> findByPayrollMonthAndPayrollYearOrderByEmployeeIdAsc(Integer payrollMonth, Integer payrollYear);

    List<Payroll> findByPaymentStatusIgnoreCaseOrderByPayrollYearDescPayrollMonthDesc(String paymentStatus);

    List<Payroll> findByPayrollYearOrderByPayrollMonthDescEmployeeIdAsc(Integer payrollYear);
}
