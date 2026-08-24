package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.dto.ChangePasswordRequestDTO;
import com.nexushr.nexushr_backend.dto.CompanySettingsDTO;
import com.nexushr.nexushr_backend.dto.NotificationPreferencesDTO;
import com.nexushr.nexushr_backend.dto.SettingsProfileDTO;
import com.nexushr.nexushr_backend.dto.UpdateProfileRequestDTO;
import com.nexushr.nexushr_backend.entity.CompanySettings;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.entity.UserNotificationPreference;
import com.nexushr.nexushr_backend.repository.CompanySettingsRepository;
import com.nexushr.nexushr_backend.repository.UserNotificationPreferenceRepository;
import com.nexushr.nexushr_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserRepository userRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final CompanySettingsRepository companySettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public SettingsProfileDTO getProfile(String email) {
        return toProfileDTO(getUserByEmail(email));
    }

    public SettingsProfileDTO updateProfile(String email, UpdateProfileRequestDTO request) {
        User user = getUserByEmail(email);
        String requestedUsername = request.getUsername().trim();
        String requestedEmail = request.getEmail().trim().toLowerCase();

        if (!user.getUsername().equalsIgnoreCase(requestedUsername) &&
                userRepository.existsByUsernameAndIdNot(requestedUsername, user.getId())) {
            throw new ResponseStatusException(CONFLICT, "Username already taken");
        }

        if (!user.getEmail().equalsIgnoreCase(requestedEmail) &&
                userRepository.existsByEmailAndIdNot(requestedEmail, user.getId())) {
            throw new ResponseStatusException(CONFLICT, "Email already in use");
        }

        boolean emailChanged = !user.getEmail().equalsIgnoreCase(requestedEmail);

        user.setUsername(requestedUsername);
        user.setFullName(request.getFullName());
        user.setEmail(requestedEmail);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDesignation(request.getDesignation());

        if (emailChanged) {
            user.setEmailVerified(false);
            refreshTokenService.revokeAllActiveTokens(user);
        }

        return toProfileDTO(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequestDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "Passwords do not match");
        }

        if (request.getNewPassword().length() < 8) {
            throw new ResponseStatusException(BAD_REQUEST, "Password must be at least 8 characters long");
        }

        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        refreshTokenService.revokeAllActiveTokens(user);
    }

    public NotificationPreferencesDTO getNotificationPreferences(String email) {
        User user = getUserByEmail(email);
        return toNotificationPreferences(getOrCreatePreference(user));
    }

    public NotificationPreferencesDTO updateNotificationPreferences(String email, NotificationPreferencesDTO request) {
        User user = getUserByEmail(email);
        UserNotificationPreference preference = getOrCreatePreference(user);
        preference.setEmailNotifications(request.emailNotifications());
        preference.setPushNotifications(request.pushNotifications());
        preference.setLeaveAlerts(request.leaveAlerts());
        preference.setPayrollAlerts(request.payrollAlerts());
        preference.setAttendanceAlerts(request.attendanceAlerts());
        preference.setWeeklyReports(request.weeklyReports());
        preference.setDarkMode(request.darkMode());
        preference.setTwoFactorEnabled(request.twoFactorEnabled());
        return toNotificationPreferences(preferenceRepository.save(preference));
    }

    public CompanySettingsDTO getCompanySettings() {
        return toCompanySettings(getOrCreateCompanySettings());
    }

    public CompanySettingsDTO updateCompanySettings(CompanySettingsDTO request) {
        CompanySettings companySettings = getOrCreateCompanySettings();
        companySettings.setCompanyName(request.companyName());
        companySettings.setCompanyEmail(request.companyEmail());
        companySettings.setCompanyPhone(request.companyPhone());
        companySettings.setAddress(request.address());
        companySettings.setWebsite(request.website());
        companySettings.setTaxId(request.taxId());
        return toCompanySettings(companySettingsRepository.save(companySettings));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private UserNotificationPreference getOrCreatePreference(User user) {
        return preferenceRepository.findByUser(user)
                .orElseGet(() -> {
                    UserNotificationPreference preference = new UserNotificationPreference();
                    preference.setUser(user);
                    return preferenceRepository.save(preference);
                });
    }

    private CompanySettings getOrCreateCompanySettings() {
        return companySettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> companySettingsRepository.save(new CompanySettings()));
    }

    private SettingsProfileDTO toProfileDTO(User user) {
        return SettingsProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .designation(user.getDesignation())
                .status(user.getStatus())
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .build();
    }

    private NotificationPreferencesDTO toNotificationPreferences(UserNotificationPreference preference) {
        return NotificationPreferencesDTO.builder()
                .emailNotifications(Boolean.TRUE.equals(preference.getEmailNotifications()))
                .pushNotifications(Boolean.TRUE.equals(preference.getPushNotifications()))
                .leaveAlerts(Boolean.TRUE.equals(preference.getLeaveAlerts()))
                .payrollAlerts(Boolean.TRUE.equals(preference.getPayrollAlerts()))
                .attendanceAlerts(Boolean.TRUE.equals(preference.getAttendanceAlerts()))
                .weeklyReports(Boolean.TRUE.equals(preference.getWeeklyReports()))
                .darkMode(Boolean.TRUE.equals(preference.getDarkMode()))
                .twoFactorEnabled(Boolean.TRUE.equals(preference.getTwoFactorEnabled()))
                .build();
    }

    private CompanySettingsDTO toCompanySettings(CompanySettings companySettings) {
        return CompanySettingsDTO.builder()
                .id(companySettings.getId())
                .companyName(companySettings.getCompanyName())
                .companyEmail(companySettings.getCompanyEmail())
                .companyPhone(companySettings.getCompanyPhone())
                .address(companySettings.getAddress())
                .website(companySettings.getWebsite())
                .taxId(companySettings.getTaxId())
                .build();
    }
}
