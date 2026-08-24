package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payrolls",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payroll_employee_month_year",
                        columnNames = {"employee_id", "payroll_month", "payroll_year"}
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee id is required")
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @NotNull(message = "Payroll month is required")
    @Min(value = 1, message = "Payroll month must be between 1 and 12")
    @Max(value = 12, message = "Payroll month must be between 1 and 12")
    @Column(name = "payroll_month", nullable = false)
    private Integer payrollMonth;

    @NotNull(message = "Payroll year is required")
    @Min(value = 2000, message = "Payroll year must be valid")
    @Column(name = "payroll_year", nullable = false)
    private Integer payrollYear;

    @NotNull(message = "Basic salary is required")
    @Column(name = "basic_salary", nullable = false)
    private Double basicSalary;

    @Column(nullable = false)
    private Double allowances = 0.0;

    @Column(nullable = false)
    private Double deductions = 0.0;

    @Column(nullable = false)
    private Double bonus = 0.0;

    @Column(name = "net_salary", nullable = false)
    private Double netSalary;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        generatedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
