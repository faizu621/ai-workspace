package com.aiworkspace.project.dto;

import java.time.LocalDateTime;

public record MilestoneResponse(
        Long id,
        Long projectId,
        String name,
        String description,
        LocalDateTime dueDate,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
