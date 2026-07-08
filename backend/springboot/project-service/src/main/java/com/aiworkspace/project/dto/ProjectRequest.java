package com.aiworkspace.project.dto;

import java.time.LocalDateTime;

public record ProjectRequest(
    String name,
    String description,
    String code,
    String priority,
    String visibility,
    LocalDateTime startDate,
    LocalDateTime endDate,
    Long ownerId,
    Long managerId,
    String color,
    String icon
) {}
