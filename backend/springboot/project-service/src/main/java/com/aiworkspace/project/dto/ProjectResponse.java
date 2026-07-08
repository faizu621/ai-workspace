package com.aiworkspace.project.dto;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        String code,
        String status,
        String priority,
        String visibility,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Long ownerId,
        Long managerId,
        boolean archived,
        String color,
        String icon) {
}
