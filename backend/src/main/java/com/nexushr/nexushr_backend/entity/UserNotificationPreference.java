package com.nexushr.nexushr_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notification_preferences")
@Data
public class UserNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Boolean emailNotifications = true;

    @Column(nullable = false)
    private Boolean pushNotifications = false;

    @Column(nullable = false)
    private Boolean leaveAlerts = true;

    @Column(nullable = false)
    private Boolean payrollAlerts = true;

    @Column(nullable = false)
    private Boolean attendanceAlerts = false;

    @Column(nullable = false)
    private Boolean weeklyReports = true;

    @Column(nullable = false)
    private Boolean darkMode = false;

    @Column(nullable = false)
    private Boolean twoFactorEnabled = false;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
