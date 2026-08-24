package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Set;

final class ServiceValidationUtils {

    private ServiceValidationUtils() {
    }

    static void validateEmployeeExists(EmployeeRepository employeeRepository, Long employeeId) {
        validateRequiredId("Employee id", employeeId);

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found with id " + employeeId
            );
        }
    }

    static void validateRequiredId(String fieldName, Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        if (id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must be greater than 0");
        }
    }

    static String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value.trim();
    }

    static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    static String normalizeUppercaseOptional(String value) {
        String normalized = normalizeOptionalText(value);
        return normalized == null ? null : normalized.toUpperCase(Locale.ROOT);
    }

    static String normalizeAllowedValue(String value, String fieldName, Set<String> allowedValues) {
        String normalized = normalizeRequiredText(value, fieldName).toUpperCase(Locale.ROOT);
        if (!allowedValues.contains(normalized)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " must be one of: " + String.join(", ", allowedValues)
            );
        }
        return normalized;
    }

    static String normalizeAllowedValueOrDefault(String value, String fieldName, Set<String> allowedValues, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return normalizeAllowedValue(value, fieldName, allowedValues);
    }

    static void validateRange(String fieldName, Double value, double min, double max) {
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        if (!Double.isFinite(value) || value < min || value > max) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " must be between " + min + " and " + max
            );
        }
    }

    static void validateIsoDate(String fieldName, String value) {
        String normalized = normalizeOptionalText(value);
        if (normalized == null) {
            return;
        }

        try {
            java.time.LocalDate.parse(normalized);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " must be a valid ISO date (yyyy-MM-dd)"
            );
        }
    }
}
