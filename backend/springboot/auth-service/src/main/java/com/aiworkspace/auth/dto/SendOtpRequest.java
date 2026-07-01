package com.aiworkspace.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOtpRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;
}
