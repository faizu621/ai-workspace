package com.aiworkspace.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class UserProfileRequest {
    private String name;
    private String bio;
    private String avatarUrl;
    private String githubUrl;
    private String twitterUrl;
    private String linkedinUrl;
}
