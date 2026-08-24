package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.NotificationRequestDTO;
import com.nexushr.nexushr_backend.entity.Notification;
import com.nexushr.nexushr_backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Notification createNotification(@Valid @RequestBody NotificationRequestDTO request) {
        return notificationService.createNotification(toEntity(request));
    }

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public Notification getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Long userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return "Notification deleted successfully";
    }

    private Notification toEntity(NotificationRequestDTO request) {
        Notification notification = new Notification();
        notification.setUserId(request.userId());
        notification.setNotificationTitle(request.notificationTitle());
        notification.setNotificationMessage(request.notificationMessage());
        notification.setNotificationType(request.notificationType());
        return notification;
    }
}
