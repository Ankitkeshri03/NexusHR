package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.entity.Role;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.repository.RoleRepository;
import com.nexushr.nexushr_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor

public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> GetAllUsers()
    {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        normalizeUser(user);
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }

        if (user.getStatus() == null) {
            user.setStatus("ACTIVE");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    public User updateUser(Long id, User updatedUser)
    {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        normalizeUser(updatedUser);

        if (updatedUser.getEmail() != null &&
                !updatedUser.getEmail().equalsIgnoreCase(existing.getEmail()))
        {

            if (userRepository.existsByEmailAndIdNot(updatedUser.getEmail(), id))
            {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            existing.setEmail(updatedUser.getEmail());
            existing.setEmailVerified(false);
        }

        if (updatedUser.getUsername() != null &&
                !updatedUser.getUsername().equalsIgnoreCase(existing.getUsername()))
        {

            if (userRepository.existsByUsernameAndIdNot(updatedUser.getUsername(), id))
            {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
            }
            existing.setUsername(updatedUser.getUsername());
        }

        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank())
        {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (updatedUser.getFullName() != null) {
            existing.setFullName(updatedUser.getFullName());
        }

        if (updatedUser.getPhoneNumber() != null) {
            existing.setPhoneNumber(updatedUser.getPhoneNumber());
        }

        if (updatedUser.getDesignation() != null) {
            existing.setDesignation(updatedUser.getDesignation());
        }

        if (updatedUser.getStatus() != null)
        {
            existing.setStatus(updatedUser.getStatus().trim().toUpperCase(Locale.ROOT));
        }

        if (updatedUser.getEmailVerified() != null) {
            existing.setEmailVerified(updatedUser.getEmailVerified());
        }

        return userRepository.save(existing);
    }

    public void deleteUser(Long id)
    {
        if (!userRepository.existsById(id))
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }

    public User getUserProfile(Long id)
    {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User assignRole(Long id, String roleName) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));

        user.getRoles().add(role);

        return userRepository.save(user);
    }

    private void normalizeUser(User user) {
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase(Locale.ROOT));
        }
        if (user.getUsername() != null) {
            user.setUsername(user.getUsername().trim());
        }
        if (user.getFullName() != null) {
            user.setFullName(user.getFullName().trim());
        }
        if (user.getPhoneNumber() != null) {
            user.setPhoneNumber(user.getPhoneNumber().trim());
        }
        if (user.getDesignation() != null) {
            user.setDesignation(user.getDesignation().trim());
        }
    }
}
