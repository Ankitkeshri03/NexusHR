package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.ChangePasswordRequestDTO;
import com.nexushr.nexushr_backend.dto.CompanySettingsDTO;
import com.nexushr.nexushr_backend.dto.NotificationPreferencesDTO;
import com.nexushr.nexushr_backend.dto.SettingsProfileDTO;
import com.nexushr.nexushr_backend.dto.UpdateProfileRequestDTO;
import com.nexushr.nexushr_backend.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/profile")
    public ResponseEntity<SettingsProfileDTO> getProfile(Authentication authentication) {
        return ResponseEntity.ok(settingsService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SettingsProfileDTO> updateProfile(Authentication authentication,
                                                            @Valid @RequestBody UpdateProfileRequestDTO request) {
        return ResponseEntity.ok(settingsService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
                                               @Valid @RequestBody ChangePasswordRequestDTO request) {
        settingsService.changePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notifications")
    public ResponseEntity<NotificationPreferencesDTO> getNotifications(Authentication authentication) {
        return ResponseEntity.ok(settingsService.getNotificationPreferences(authentication.getName()));
    }

    @PutMapping("/notifications")
    public ResponseEntity<NotificationPreferencesDTO> updateNotifications(Authentication authentication,
                                                                          @Valid @RequestBody NotificationPreferencesDTO request) {
        return ResponseEntity.ok(settingsService.updateNotificationPreferences(authentication.getName(), request));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanySettingsDTO> getCompanySettings() {
        return ResponseEntity.ok(settingsService.getCompanySettings());
    }

    @PutMapping("/company")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanySettingsDTO> updateCompanySettings(@Valid @RequestBody CompanySettingsDTO request) {
        return ResponseEntity.ok(settingsService.updateCompanySettings(request));
    }
}
