package com.nexushr.nexushr_backend.dto;

import lombok.Builder;

@Builder
public record NotificationPreferencesDTO(
        boolean emailNotifications,
        boolean pushNotifications,
        boolean leaveAlerts,
        boolean payrollAlerts,
        boolean attendanceAlerts,
        boolean weeklyReports,
        boolean darkMode,
        boolean twoFactorEnabled
) {
}
