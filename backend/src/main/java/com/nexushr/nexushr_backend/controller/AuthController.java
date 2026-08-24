package com.nexushr.nexushr_backend.controller;

import com.nexushr.nexushr_backend.dto.AuthResponseDTO;
import com.nexushr.nexushr_backend.dto.AuthUserDTO;
import com.nexushr.nexushr_backend.dto.ActionResponseDTO;
import com.nexushr.nexushr_backend.dto.ForgotPasswordRequestDTO;
import com.nexushr.nexushr_backend.dto.LoginRequestDTO;
import com.nexushr.nexushr_backend.dto.LogoutRequestDTO;
import com.nexushr.nexushr_backend.dto.RefreshTokenRequestDTO;
import com.nexushr.nexushr_backend.dto.ResendVerificationRequestDTO;
import com.nexushr.nexushr_backend.dto.ResetPasswordRequestDTO;
import com.nexushr.nexushr_backend.dto.SignupRequestDTO;
import com.nexushr.nexushr_backend.dto.VerifyEmailRequestDTO;
import com.nexushr.nexushr_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signup(@Valid @RequestBody SignupRequestDTO request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequestDTO request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ActionResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ActionResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ActionResponseDTO> verifyEmail(@Valid @RequestBody VerifyEmailRequestDTO request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ActionResponseDTO> resendVerification(@Valid @RequestBody ResendVerificationRequestDTO request) {
        return ResponseEntity.ok(authService.resendVerification(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserDTO> me(Authentication authentication) {
        return ResponseEntity.ok(authService.currentUser(authentication));
    }
}
