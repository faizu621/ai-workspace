package com.aiworkspace.project.dto;

import java.time.LocalDateTime;

public record ProjectActivityResponse(
    Long id,
    Long projectId,
    Long userId,
    String activityType,
    String description,
    LocalDateTime createdAt
) {}
