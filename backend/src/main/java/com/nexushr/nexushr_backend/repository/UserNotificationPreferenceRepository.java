package com.nexushr.nexushr_backend.repository;

import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.entity.UserNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, Long> {
    Optional<UserNotificationPreference> findByUser(User user);
}
