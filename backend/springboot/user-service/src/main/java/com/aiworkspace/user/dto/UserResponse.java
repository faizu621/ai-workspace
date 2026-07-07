package com.aiworkspace.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private String bio;
    private String avatarUrl;
    private String githubUrl;
    private String twitterUrl;
    private String linkedinUrl;
}