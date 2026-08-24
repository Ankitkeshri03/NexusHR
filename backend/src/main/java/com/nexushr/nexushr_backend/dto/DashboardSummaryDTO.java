package com.nexushr.nexushr_backend.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record DashboardSummaryDTO(
        long totalEmployees,
        long presentToday,
        long onLeave,
        long newJoinees,
        List<RecentEmployeeDTO> recentEmployees
) {
}
