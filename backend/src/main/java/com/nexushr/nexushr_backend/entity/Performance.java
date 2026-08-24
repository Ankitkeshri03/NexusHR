package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
@Data
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Employee id is required")
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @NotNull(message = "Attendance date is required")
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "total_hours")
    private Double totalHours;

    @Column(name = "attendance_status")
    private String attendanceStatus;
    // Present / Absent / Leave / Half-Day

    @Column(name = "work_mode")
    private String workMode;
    // Office / WFH / Hybrid
}
