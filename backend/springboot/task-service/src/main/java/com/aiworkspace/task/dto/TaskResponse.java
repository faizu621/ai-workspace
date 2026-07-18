package com.aiworkspace.task.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(
    Long id,
    String title,
    String description,
    Long projectId,
    Long sprintId,
    Long milestoneId,
    Long parentTaskId,
    String priority,
    String status,
    String type,
    Integer storyPoints,
    Double estimatedHours,
    Double actualHours,
    LocalDate startDate,
    LocalDate dueDate,
    Long createdBy,
    List<Long> assigneeIds,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
