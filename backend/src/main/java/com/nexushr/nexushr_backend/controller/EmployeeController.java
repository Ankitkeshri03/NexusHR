package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.EmployeeRequestDTO;
import com.nexushr.nexushr_backend.dto.TransferEmployeeRequestDTO;
import com.nexushr.nexushr_backend.entity.Employee;
import com.nexushr.nexushr_backend.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;
    @GetMapping
    public ResponseEntity<List<Employee>> getEmployees(@RequestParam(required = false) Long departmentId,
                                                       @RequestParam(required = false) String status,
                                                       @RequestParam(required = false) String search) {
        return ResponseEntity.ok(employeeService.getAllEmployees(departmentId, status, search));
    }
    @GetMapping("/{employeeId}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long employeeId) {
        return ResponseEntity.ok(employeeService.getEmployeeById(employeeId));
    }
    @GetMapping("/code/{employeeCode}")
    public ResponseEntity<Employee> getEmployeeByCode(@PathVariable String employeeCode) {
        return ResponseEntity.ok(employeeService.getEmployeeByCode(employeeCode));
    }
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> addEmployee(@Valid @RequestBody EmployeeRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(toEntity(request)));
    }
    @PutMapping("/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long employeeId,
                                                   @Valid @RequestBody EmployeeRequestDTO request) {
        return ResponseEntity.ok(employeeService.updateEmployee(employeeId, toEntity(request)));
    }
    @PatchMapping("/{employeeId}/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> transferEmployee(@PathVariable Long employeeId,
                                                     @Valid @RequestBody TransferEmployeeRequestDTO request) {
        return ResponseEntity.ok(employeeService.transferEmployee(employeeId, request.departmentId()));
    }
    @DeleteMapping("/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.noContent().build();
    }

    private Employee toEntity(EmployeeRequestDTO request) {
        Employee employee = new Employee();
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setName(request.getName());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setGender(request.getGender());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setEmail(request.getEmail());
        employee.setAge(request.getAge());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setAddress(request.getAddress());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setDepartmentId(request.getDepartmentId());
        employee.setDesignationId(request.getDesignationId());
        employee.setManagerId(request.getManagerId());
        employee.setEmploymentStatus(request.getEmploymentStatus());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setSalary(request.getSalary());
        employee.setProfileImage(request.getProfileImage());
        employee.setImage(request.getImage());
        return employee;
    }
}
