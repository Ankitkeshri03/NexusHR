package com.nexushr.nexushr_backend.service;

import com.nexushr.nexushr_backend.dto.ActionResponseDTO;
import com.nexushr.nexushr_backend.dto.AuthResponseDTO;
import com.nexushr.nexushr_backend.dto.AuthUserDTO;
import com.nexushr.nexushr_backend.dto.ForgotPasswordRequestDTO;
import com.nexushr.nexushr_backend.dto.LoginRequestDTO;
import com.nexushr.nexushr_backend.dto.LogoutRequestDTO;
import com.nexushr.nexushr_backend.dto.RefreshTokenRequestDTO;
import com.nexushr.nexushr_backend.dto.ResendVerificationRequestDTO;
import com.nexushr.nexushr_backend.dto.ResetPasswordRequestDTO;
import com.nexushr.nexushr_backend.dto.SignupRequestDTO;
import com.nexushr.nexushr_backend.dto.VerifyEmailRequestDTO;
import com.nexushr.nexushr_backend.entity.Role;
import com.nexushr.nexushr_backend.entity.SecurityToken.TokenType;
import com.nexushr.nexushr_backend.entity.User;
import com.nexushr.nexushr_backend.repository.RoleRepository;
import com.nexushr.nexushr_backend.repository.UserRepository;
import com.nexushr.nexushr_backend.security.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.LOCKED;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final SecurityTokenService securityTokenService;
    private final EmailService emailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${security.auth.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${security.auth.lockout-duration-minutes:15}")
    private long lockoutDurationMinutes;

    @Value("${security.token.email-verification-hours:24}")
    private long emailVerificationHours;

    @Value("${security.token.password-reset-hours:2}")
    private long passwordResetHours;

    @Transactional
    public AuthResponseDTO signup(SignupRequestDTO request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String username = request.getUsername().trim();
        String password = request.getPassword();

        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(BAD_REQUEST, "Password must be at least 8 characters long");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already in use");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(BAD_REQUEST, "Username already taken");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(normalizedEmail);
        user.setPhoneNumber(blankToNull(request.getPhoneNumber()));
        user.setPassword(passwordEncoder.encode(password));
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        user.getRoles().add(resolveDefaultRole());

        User savedUser = userRepository.save(user);
        String verificationToken = securityTokenService.issueToken(
                savedUser,
                TokenType.EMAIL_VERIFICATION,
                LocalDateTime.now().plusHours(emailVerificationHours)
        );
        emailService.sendVerificationEmail(savedUser.getEmail(), buildVerificationUrl(savedUser.getEmail(), verificationToken));

        return createAuthResponse(savedUser, "signup");
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid email or password"));

        enforceAccountAccess(user);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            registerFailedLogin(user);
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());

        return createAuthResponse(userRepository.save(user), "login");
    }

    @Transactional
    public AuthResponseDTO refresh(RefreshTokenRequestDTO request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.isTokenValid(refreshToken, "refresh")) {
            refreshTokenService.revoke(refreshToken);
            throw new ResponseStatusException(UNAUTHORIZED, "Refresh token is invalid or expired");
        }

        User user = userRepository.findByEmail(jwtService.extractEmail(refreshToken))
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Refresh token is invalid or expired"));

        enforceAccountAccess(user);
        refreshTokenService.validateActiveToken(user, refreshToken);
        refreshTokenService.rotate(user, refreshToken);

        return createAuthResponse(user, "refresh");
    }

    @Transactional
    public void logout(LogoutRequestDTO request) {
        refreshTokenService.revoke(request.getRefreshToken());
    }

    @Transactional(readOnly = true)
    public AuthUserDTO currentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Authentication required");
        }

        User user = userRepository.findByEmail(normalizeEmail(authentication.getName()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        return toAuthUser(user);
    }

    @Transactional
    public ActionResponseDTO forgotPassword(ForgotPasswordRequestDTO request) {
        userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .filter(user -> "ACTIVE".equalsIgnoreCase(user.getStatus()))
                .ifPresent(user -> {
                    String resetToken = securityTokenService.issueToken(
                            user,
                            TokenType.PASSWORD_RESET,
                            LocalDateTime.now().plusHours(passwordResetHours)
                    );
                    emailService.sendPasswordResetEmail(user.getEmail(), buildResetPasswordUrl(resetToken));
                });

        return new ActionResponseDTO("If the account exists, a password reset email has been sent.");
    }

    @Transactional
    public ActionResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "Passwords do not match");
        }

        if (request.getNewPassword().length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(BAD_REQUEST, "Password must be at least 8 characters long");
        }

        User user = securityTokenService.consumeToken(request.getToken(), TokenType.PASSWORD_RESET);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setEmailVerified(true);
        user.setFirstLogin(false);
        user.setPasswordUpdatedAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        refreshTokenService.revokeAllActiveTokens(user);

        return new ActionResponseDTO("Password reset successful. You can now sign in.");
    }

    @Transactional
    public ActionResponseDTO verifyEmail(VerifyEmailRequestDTO request) {
        User user = securityTokenService.consumeToken(request.getToken(), TokenType.EMAIL_VERIFICATION);
        user.setEmailVerified(true);
        userRepository.save(user);

        return new ActionResponseDTO("Email verified successfully.");
    }

    @Transactional
    public ActionResponseDTO resendVerification(ResendVerificationRequestDTO request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new ActionResponseDTO("Email is already verified.");
        }

        String verificationToken = securityTokenService.issueToken(
                user,
                TokenType.EMAIL_VERIFICATION,
                LocalDateTime.now().plusHours(emailVerificationHours)
        );
        emailService.sendVerificationEmail(user.getEmail(), buildVerificationUrl(user.getEmail(), verificationToken));

        return new ActionResponseDTO("A new email verification link has been sent.");
    }

    private void enforceAccountAccess(User user) {
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(LOCKED, "Your account is inactive");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    LOCKED,
                    "Your account is temporarily locked until " + user.getLockedUntil()
            );
        }
    }

    private void registerFailedLogin(User user) {
        int attempts = Optional.ofNullable(user.getFailedLoginAttempts()).orElse(0) + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= maxFailedAttempts) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            user.setFailedLoginAttempts(0);
        }

        userRepository.save(user);
    }

    private AuthResponseDTO createAuthResponse(User user, String issuedFor) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        refreshTokenService.store(user, refreshToken, jwtService.getRefreshTokenExpiry(), issuedFor);

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationSeconds())
                .user(toAuthUser(user))
                .build();
    }

    private AuthUserDTO toAuthUser(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .map(this::normalizeRoleName)
                .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));

        return AuthUserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus())
                .roles(roles)
                .firstLogin(user.getFirstLogin())
                .build();
    }

    private Role resolveDefaultRole() {
        return roleRepository.findByRoleName("EMPLOYEE")
                .or(() -> roleRepository.findByRoleName("ROLE_EMPLOYEE"))
                .orElseGet(() -> roleRepository.save(new Role(null, "EMPLOYEE", "Default employee role", null, new java.util.HashSet<>())));
    }

    private String normalizeRoleName(String roleName) {
        return roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String buildResetPasswordUrl(String token) {
        return normalizeFrontendBaseUrl() + "/reset-password?token=" + urlEncode(token);
    }

    private String buildVerificationUrl(String email, String token) {
        return normalizeFrontendBaseUrl()
                + "/verify-email?token="
                + urlEncode(token)
                + "&email="
                + urlEncode(email);
    }

    private String normalizeFrontendBaseUrl() {
        return frontendBaseUrl.endsWith("/") ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1) : frontendBaseUrl;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
