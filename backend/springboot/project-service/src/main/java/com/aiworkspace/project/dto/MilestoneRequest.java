package com.aiworkspace.project.dto;

import java.time.LocalDateTime;

public record MilestoneRequest(
        String name,
        String description,
        LocalDateTime dueDate,
        String status) {
}
