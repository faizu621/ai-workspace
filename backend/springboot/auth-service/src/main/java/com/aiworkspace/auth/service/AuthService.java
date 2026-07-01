package com.aiworkspace.auth.service;

import com.aiworkspace.auth.config.JwtService;
import com.aiworkspace.auth.dto.AuthResponse;
import com.aiworkspace.auth.dto.ForgotPasswordRequest;
import com.aiworkspace.auth.dto.LoginRequest;
import com.aiworkspace.auth.dto.RegisterRequest;
import com.aiworkspace.auth.dto.ResetPasswordRequest;
import com.aiworkspace.auth.dto.ChangePasswordRequest;
import com.aiworkspace.auth.dto.VerifyEmailRequest;
import com.aiworkspace.auth.dto.SendOtpRequest;
import com.aiworkspace.auth.dto.VerifyOtpRequest;
import com.aiworkspace.auth.dto.RefreshRequest;
import com.aiworkspace.auth.model.Role;
import com.aiworkspace.auth.model.User;
import com.aiworkspace.auth.model.UserSession;
import com.aiworkspace.auth.repository.UserRepository;
import com.aiworkspace.auth.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserSessionRepository sessionRepository;
    private final jakarta.servlet.http.HttpServletRequest httpServletRequest;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already in use");
        }

        // Set role based on email - let's make the first user or administrative email
        // an ADMIN
        Role role = Role.MEMBER;
        if (request.getEmail().equalsIgnoreCase("alex.rivera@workspace.ai") || request.getEmail().contains("admin")) {
            role = Role.ADMIN;
        }

        String code = String.format("%06d", new Random().nextInt(999999));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .verificationCode(code)
                .verificationCodeExpiry(LocalDateTime.now().plusHours(24))
                .emailVerified(false)
                .build();

        System.out.println("Email verification code for " + request.getEmail() + " is: " + code);

        User savedUser = userRepository.save(user);
        createUserSession(savedUser);
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        createUserSession(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private void createUserSession(User user) {
        String userAgent = httpServletRequest.getHeader("User-Agent");
        String ipAddress = httpServletRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpServletRequest.getRemoteAddr();
        }

        UserSession session = UserSession.builder()
                .user(user)
                .device(userAgent != null ? userAgent : "Unknown Device")
                .ip(ipAddress != null ? ipAddress : "127.0.0.1")
                .location("Local Connection")
                .lastActive(LocalDateTime.now())
                .active(true)
                .build();
        sessionRepository.save(session);
    }

    public boolean validateToken(String token) {
        return jwtService.isTokenValid(token);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        System.out.println("Password reset link: http://localhost:3000/reset-password?token=" + token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getCode())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiry() == null
                || user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }

    public void sendOtp(SendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes
        userRepository.save(user);

        System.out.println("OTP code for " + request.getEmail() + " is: " + otpCode);
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email does not exist"));

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP code");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP code has expired");
        }

        // Clear OTP after successful verification
        user.setOtp(null);
        user.setOtpExpiry(null);
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    public AuthResponse refreshToken(RefreshRequest request) {
        String email = jwtService.extractEmailFromExpiredToken(request.getToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newToken = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .token(newToken)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public List<UserSession> getActiveSessions(String email) {
        return sessionRepository.findByUserEmail(email);
    }

    public void deleteSession(String email, Long sessionId) {
        UserSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (!session.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Unauthorized to terminate this session");
        }
        sessionRepository.delete(session);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
