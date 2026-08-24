package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Employee;
import com.nexushr.nexushr_backend.entity.SecurityToken.TokenType;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import com.nexushr.nexushr_backend.repository.UserRepository;
import com.nexushr.nexushr_backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.entity.Role;

import java.util.List;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityTokenService securityTokenService;
    private final EmailService emailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${security.token.password-reset-hours:2}")
    private long passwordResetHours;

    private String generateBootstrapPassword() {
        return "Temp@" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    public List<Employee> getAllEmployees(Long departmentId, String status, String search) {
        List<Employee> employees;

        if (departmentId != null && status != null && !status.isBlank()) {
            employees = employeeRepository.findByDepartmentIdAndEmploymentStatusIgnoreCase(departmentId, status);
        } else if (departmentId != null) {
            employees = employeeRepository.findByDepartmentId(departmentId);
        } else if (status != null && !status.isBlank()) {
            employees = employeeRepository.findByEmploymentStatusIgnoreCase(status);
        } else {
            employees = employeeRepository.findAll();
        }

        if (search == null || search.isBlank()) {
            return employees;
        }

        String keyword = search.toLowerCase(Locale.ROOT);
        return employees.stream()
                .filter(employee -> contains(employee.getEmployeeCode(), keyword)
                        || contains(employee.getName(), keyword)
                        || contains(employee.getFirstName(), keyword)
                        || contains(employee.getLastName(), keyword)
                        || contains(employee.getEmail(), keyword))
                .toList();
    }

    public Employee getEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with id " + employeeId
                ));
    }

    public Employee getEmployeeByCode(String employeeCode) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found with code " + employeeCode
                ));
    }

    public Employee createEmployee(Employee employee) {
        employee.setId(null);
        normalizeEmployee(employee);
        validateUniqueFields(employee, null);
        String bootstrapPassword = generateBootstrapPassword();
        User user = new User();
        user.setUsername(employee.getEmail());
        user.setEmail(employee.getEmail());
        user.setFullName(
                employee.getFirstName() + " " + employee.getLastName()
        );

        user.setPhoneNumber(employee.getPhoneNumber());

        user.setPassword(
                passwordEncoder.encode(bootstrapPassword)
        );
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        user.setFirstLogin(true);

        Role employeeRole =
                roleRepository.findByRoleName("EMPLOYEE")
                        .orElseThrow(() ->
                                new RuntimeException("EMPLOYEE role not found"));

        user.getRoles().add(employeeRole);
        User savedUser = userRepository.save(user);
        employee.setUserId(savedUser.getId());

        String setupToken = securityTokenService.issueToken(
                savedUser,
                TokenType.PASSWORD_RESET,
                LocalDateTime.now().plusHours(passwordResetHours)
        );

        emailService.sendEmployeeWelcomeEmail(
                employee.getEmail(),
                employee.getFirstName() + " " + employee.getLastName(),
                buildResetPasswordUrl(setupToken)
        );
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long employeeId, Employee employeeRequest) {
        Employee employee = getEmployeeById(employeeId);
        normalizeEmployee(employeeRequest);
        validateUniqueFields(employeeRequest, employeeId);

        employee.setEmployeeCode(employeeRequest.getEmployeeCode());
        employee.setName(employeeRequest.getName());
        employee.setFirstName(employeeRequest.getFirstName());
        employee.setLastName(employeeRequest.getLastName());
        employee.setGender(employeeRequest.getGender());
        employee.setDateOfBirth(employeeRequest.getDateOfBirth());
        employee.setEmail(employeeRequest.getEmail());
        employee.setAge(employeeRequest.getAge());
        employee.setPhoneNumber(employeeRequest.getPhoneNumber());
        employee.setAddress(employeeRequest.getAddress());
        employee.setJoiningDate(employeeRequest.getJoiningDate());
        employee.setDepartmentId(employeeRequest.getDepartmentId());
        employee.setDesignationId(employeeRequest.getDesignationId());
        employee.setManagerId(employeeRequest.getManagerId());
        employee.setEmploymentStatus(employeeRequest.getEmploymentStatus());
        employee.setEmploymentType(employeeRequest.getEmploymentType());
        employee.setSalary(employeeRequest.getSalary());
        employee.setProfileImage(employeeRequest.getProfileImage());
        employee.setImage(employeeRequest.getImage());
        return employeeRepository.save(employee);
    }

    public Employee transferEmployee(Long employeeId, Long departmentId) {
        if (departmentId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department id is required for transfer");
        }

        Employee employee = getEmployeeById(employeeId);
        employee.setDepartmentId(departmentId);
        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);
        employeeRepository.delete(employee);
    }

    private void validateUniqueFields(Employee employee, Long employeeId) {
        if (employee.getEmployeeCode() == null || employee.getEmployeeCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee code is required");
        }

        boolean duplicateCode = employeeId == null
                ? employeeRepository.existsByEmployeeCode(employee.getEmployeeCode())
                : employeeRepository.existsByEmployeeCodeAndIdNot(employee.getEmployeeCode(), employeeId);

        if (duplicateCode) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee code already exists");
        }

        boolean duplicateEmail = employeeId == null
                ? employeeRepository.existsByEmail(employee.getEmail())
                : employeeRepository.existsByEmailAndIdNot(employee.getEmail(), employeeId);

        if (duplicateEmail) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee email already exists");
        }
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private void normalizeEmployee(Employee employee) {
        if (employee.getName() != null) {
            employee.setName(employee.getName().trim());
        }

        if ((employee.getName() == null || employee.getName().isBlank())
                && employee.getFirstName() != null
                && employee.getLastName() != null) {
            employee.setName((employee.getFirstName() + " " + employee.getLastName()).trim());
        }

        if ((employee.getFirstName() == null || employee.getFirstName().isBlank())
                && employee.getName() != null
                && !employee.getName().isBlank()) {
            String[] parts = employee.getName().trim().split("\\s+", 2);
            employee.setFirstName(parts[0]);
            employee.setLastName(parts.length > 1 ? parts[1] : parts[0]);
        }

        if (employee.getImage() != null && !employee.getImage().isBlank()
                && (employee.getProfileImage() == null || employee.getProfileImage().isBlank())) {
            employee.setProfileImage(employee.getImage());
        }

        if ((employee.getImage() == null || employee.getImage().isBlank())
                && employee.getProfileImage() != null && !employee.getProfileImage().isBlank()) {
            employee.setImage(employee.getProfileImage());
        }

        if (employee.getJoiningDate() == null) {
            employee.setJoiningDate(LocalDate.now());
        }

        if (employee.getEmploymentStatus() == null || employee.getEmploymentStatus().isBlank()) {
            employee.setEmploymentStatus("Active");
        }

        if (employee.getEmploymentType() == null || employee.getEmploymentType().isBlank()) {
            employee.setEmploymentType("Full Time");
        } else {
            employee.setEmploymentType(employee.getEmploymentType().trim());
        }

        if (employee.getSalary() == null) {
            employee.setSalary(0.0);
        }

        if (employee.getEmployeeCode() != null) {
            employee.setEmployeeCode(employee.getEmployeeCode().trim());
        }

        if (employee.getEmail() != null) {
            employee.setEmail(employee.getEmail().trim().toLowerCase(Locale.ROOT));
        }
    }

    private String buildResetPasswordUrl(String token) {
        String normalizedBaseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;

        return normalizedBaseUrl + "/reset-password?token=" + token;
    }
}
