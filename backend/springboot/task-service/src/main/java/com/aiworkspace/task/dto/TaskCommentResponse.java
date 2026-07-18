package com.aiworkspace.task.dto;

import java.time.LocalDateTime;

public record TaskCommentResponse(
        Long id,
        Long taskId,
        Long userId,
        String content,
        Long parentCommentId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
