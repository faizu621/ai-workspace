package com.aiworkspace.task.dto;

public record TaskCommentRequest(
        String content,
        Long parentCommentId) {
}
