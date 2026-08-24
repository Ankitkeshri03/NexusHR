package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.AttendanceRequestDTO;
import com.nexushr.nexushr_backend.entity.Attendance;
import com.nexushr.nexushr_backend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Attendance> markAttendance(@Valid @RequestBody AttendanceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.markAttendance(toEntity(request)));
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance(@RequestParam(required = false) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(attendanceService.getByDate(date));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/{attendanceId}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Long attendanceId) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(attendanceId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ResponseEntity<Attendance> getByEmployeeAndDate(@PathVariable Long employeeId,
                                                           @PathVariable LocalDate date) {
        return ResponseEntity.ok(attendanceService.getByEmployeeAndDate(employeeId, date));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> getByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(attendanceService.getByDate(date));
    }

    @PutMapping("/{attendanceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long attendanceId,
                                                       @Valid @RequestBody AttendanceRequestDTO request) {
        return ResponseEntity.ok(attendanceService.updateAttendance(attendanceId, toEntity(request)));
    }

    @DeleteMapping("/{attendanceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long attendanceId) {
        attendanceService.deleteAttendance(attendanceId);
        return ResponseEntity.noContent().build();
    }

    private Attendance toEntity(AttendanceRequestDTO request) {
        Attendance attendance = new Attendance();
        attendance.setEmployeeId(request.employeeId());
        attendance.setAttendanceDate(request.attendanceDate());
        attendance.setCheckIn(request.checkInTime());
        attendance.setCheckOut(request.checkOutTime());
        attendance.setStatus(request.attendanceStatus());
        attendance.setWorkMode(request.workMode());
        return attendance;
    }
}
