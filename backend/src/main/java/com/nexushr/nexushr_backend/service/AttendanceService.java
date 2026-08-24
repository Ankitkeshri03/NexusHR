package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Attendance;
import com.nexushr.nexushr_backend.entity.Employee;
import com.nexushr.nexushr_backend.repository.AttendanceRepository;
import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public Attendance markAttendance(Attendance attendance) {
        attendance.setId(null);
        validateEmployeeExists(attendance.getEmployeeId());
        normalizeAttendance(attendance);

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(
                attendance.getEmployeeId(), attendance.getAttendanceDate())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Attendance already exists for employee " + attendance.getEmployeeId()
                            + " on " + attendance.getAttendanceDate()
            );
        }

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Long attendanceId) {
        return attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attendance not found with id " + attendanceId
                ));
    }

    public List<Attendance> getByEmployee(Long employeeId) {
        validateEmployeeExists(employeeId);
        return attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employeeId);
    }

    public Attendance getByEmployeeAndDate(Long employeeId, LocalDate date) {
        validateEmployeeExists(employeeId);
        return attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, date)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attendance not found for employee " + employeeId + " on " + date
                ));
    }

    public List<Attendance> getByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public Attendance updateAttendance(Long attendanceId, Attendance attendanceRequest) {
        Attendance attendance = getAttendanceById(attendanceId);

        if (attendanceRequest.getEmployeeId() == null) {
            attendanceRequest.setEmployeeId(attendance.getEmployeeId());
        }

        if (attendanceRequest.getAttendanceDate() == null) {
            attendanceRequest.setAttendanceDate(attendance.getAttendanceDate());
        }

        validateEmployeeExists(attendanceRequest.getEmployeeId());
        normalizeAttendance(attendanceRequest);

        attendanceRepository.findByEmployeeIdAndAttendanceDate(
                        attendanceRequest.getEmployeeId(),
                        attendanceRequest.getAttendanceDate()
                )
                .filter(existing -> !existing.getId().equals(attendanceId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Attendance already exists for employee " + attendanceRequest.getEmployeeId()
                                    + " on " + attendanceRequest.getAttendanceDate()
                    );
                });

        attendance.setEmployeeId(attendanceRequest.getEmployeeId());
        attendance.setAttendanceDate(attendanceRequest.getAttendanceDate());
        attendance.setCheckIn(attendanceRequest.getCheckIn());
        attendance.setCheckOut(attendanceRequest.getCheckOut());
        attendance.setWorkingHours(attendanceRequest.getWorkingHours());
        attendance.setStatus(attendanceRequest.getStatus());
        attendance.setWorkMode(attendanceRequest.getWorkMode());

        return attendanceRepository.save(attendance);
    }

    public void deleteAttendance(Long id) {
        Attendance attendance = getAttendanceById(id);
        attendanceRepository.delete(attendance);
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
                    "Cannot mark attendance for inactive employee " + employeeId
            );
        }
    }

    private void normalizeAttendance(Attendance attendance) {
        if (attendance.getAttendanceDate() == null) {
            attendance.setAttendanceDate(LocalDate.now());
        }

        if (attendance.getStatus() == null || attendance.getStatus().isBlank()) {
            attendance.setStatus("PRESENT");
        } else {
            attendance.setStatus(attendance.getStatus().trim().toUpperCase(Locale.ROOT));
        }

        if (attendance.getWorkMode() == null || attendance.getWorkMode().isBlank()) {
            attendance.setWorkMode("OFFICE");
        } else {
            attendance.setWorkMode(attendance.getWorkMode().trim().toUpperCase(Locale.ROOT));
        }

        if (attendance.getCheckIn() != null && attendance.getCheckOut() != null) {
            if (attendance.getCheckOut().isBefore(attendance.getCheckIn())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Check-out time cannot be before check-in time"
                );
            }

            Duration duration = Duration.between(attendance.getCheckIn(), attendance.getCheckOut());
            double totalHours = BigDecimal.valueOf(duration.toMinutes() / 60.0)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
            attendance.setWorkingHours(totalHours);
        } else if (attendance.getCheckOut() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check-in time is required when check-out time is provided"
            );
        } else if (attendance.getCheckIn() == null) {
            attendance.setWorkingHours(null);
        }
    }
}
