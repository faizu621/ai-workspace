package com.aiworkspace.project.dto;

import java.time.LocalDateTime;

public record ProjectMemberResponse(
    Long id,
    Long projectId,
    Long userId,
    String role,
    LocalDateTime joinedAt
) {}
