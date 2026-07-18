package com.aiworkspace.task.dto;

import java.time.LocalDate;
import java.util.List;

public record TaskRequest(
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
    LocalDate startDate,
    LocalDate dueDate,
    List<Long> assigneeIds
) {}
