package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.dto.DashboardSummaryDTO;
import com.nexushr.nexushr_backend.dto.RecentEmployeeDTO;
import com.nexushr.nexushr_backend.entity.Employee;
import com.nexushr.nexushr_backend.repository.AttendanceRepository;
import com.nexushr.nexushr_backend.repository.DepartmentRepository;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final DepartmentRepository departmentRepository;

    public DashboardSummaryDTO getDashboardSummary() {
        List<Employee> employees = employeeRepository.findAll();
        LocalDate today = LocalDate.now();

        Map<Long, String> departments = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(department -> department.getId(), department -> department.getDepartmentName()));

        long totalEmployees = employees.size();
        long presentToday = attendanceRepository.findByAttendanceDate(today).stream()
                .filter(attendance -> "PRESENT".equalsIgnoreCase(attendance.getStatus()))
                .count();
        long onLeave = leaveRepository.findAll().stream()
                .filter(leave -> "APPROVED".equalsIgnoreCase(leave.getApprovalStatus()))
                .filter(leave -> !leave.getStartDate().isAfter(today) && !leave.getEndDate().isBefore(today))
                .count();
        long newJoinees = employees.stream()
                .filter(employee -> employee.getJoiningDate() != null)
                .filter(employee -> !employee.getJoiningDate().isBefore(today.minusDays(30)))
                .count();

        List<RecentEmployeeDTO> recentEmployees = employees.stream()
                .filter(employee -> employee.getJoiningDate() != null)
                .sorted(Comparator.comparing(Employee::getJoiningDate).reversed())
                .limit(5)
                .map(employee -> RecentEmployeeDTO.builder()
                        .id(employee.getId())
                        .name(employee.getName())
                        .department(departments.getOrDefault(employee.getDepartmentId(), "Unassigned"))
                        .status(employee.getEmploymentStatus())
                        .joined(employee.getJoiningDate())
                        .build())
                .toList();

        return DashboardSummaryDTO.builder()
                .totalEmployees(totalEmployees)
                .presentToday(presentToday)
                .onLeave(onLeave)
                .newJoinees(newJoinees)
                .recentEmployees(recentEmployees)
                .build();
    }
}
