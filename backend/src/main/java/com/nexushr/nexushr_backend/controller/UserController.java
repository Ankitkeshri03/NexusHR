package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.UserRequestDTO;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> CreateUser(@Valid @RequestBody UserRequestDTO request)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(toEntity(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> UpdateUser(@PathVariable Long id, @Valid @RequestBody UserRequestDTO request)
    {
        return ResponseEntity.ok(userService.updateUser(id, toEntity(request)));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> DeleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> GetUserProfile(@PathVariable Long id)
    {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> GetAllUsers()
    {
        return ResponseEntity.ok(userService.GetAllUsers());
    }

    @PostMapping("/{userId}/assign-role")
    @PreAuthorize("hasRole('ADMIN')")
    public User assignRole(
            @PathVariable Long userId,
            @RequestParam String roleName
    ) {
        return userService.assignRole(userId, roleName);
    }

    private User toEntity(UserRequestDTO request) {
        User user = new User();
        user.setUsername(request.username());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setPhoneNumber(request.phoneNumber());
        user.setDesignation(request.designation());
        user.setStatus(request.status());
        user.setEmailVerified(request.emailVerified());
        return user;
    }
}
