package com.aiworkspace.task.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aiworkspace.task.model.TaskComment;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskIdOrderByCreatedAtAsc(long taskId);

    List<TaskComment> findByParentCommentId(Long parentCommentId);

    void deleteByTaskId(Long taskId);
}
