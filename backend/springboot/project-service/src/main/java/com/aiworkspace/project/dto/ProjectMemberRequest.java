package com.aiworkspace.project.dto;

public record ProjectMemberRequest(
    Long userId,
    String role
) {}
