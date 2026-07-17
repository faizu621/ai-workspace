package com.aiworkspace.project.dto;

public record ProjectSettingsResponse(
        Long id,
        String name,
        String description,
        String priority,
        String visibility,
        String color,
        String icon,
        Long managerId) {
}
