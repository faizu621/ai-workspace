package com.aiworkspace.task.service;

import com.aiworkspace.task.config.UserPrincipal;
import com.aiworkspace.task.dto.TaskCommentRequest;
import com.aiworkspace.task.dto.TaskCommentResponse;
import com.aiworkspace.task.dto.TaskRequest;
import com.aiworkspace.task.dto.TaskResponse;
import com.aiworkspace.task.model.Project;
import com.aiworkspace.task.model.ProjectMember;
import com.aiworkspace.task.model.Task;
import com.aiworkspace.task.model.TaskAssignee;
import com.aiworkspace.task.model.TaskComment;
import com.aiworkspace.task.model.User;
import com.aiworkspace.task.repository.ProjectMemberRepository;
import com.aiworkspace.task.repository.ProjectRepository;
import com.aiworkspace.task.repository.TaskAssigneeRepository;
import com.aiworkspace.task.repository.TaskCommentRepository;
import com.aiworkspace.task.repository.TaskRepository;
import com.aiworkspace.task.repository.UserRepository;
import com.aiworkspace.task.dto.TaskCommentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskCommentRepository taskCommentRepository;

    @Transactional
    public TaskResponse createTask(UserPrincipal principal, TaskRequest request) {
        if (request.projectId() == null) {
            throw new IllegalArgumentException("Project ID is required");
        }

        Project project = projectRepository.findById(request.projectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project not found or deleted with ID: " + request.projectId()));

        // Permission check: Global Admin OR project member
        if (!isGlobalAdmin(principal) && !isProjectMember(request.projectId(), principal.getId(), project)) {
            throw new IllegalArgumentException("Access denied: You must be a member of the project to create tasks");
        }

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .projectId(request.projectId())
                .sprintId(request.sprintId())
                .milestoneId(request.milestoneId())
                .parentTaskId(request.parentTaskId())
                .priority(request.priority() != null ? request.priority().toUpperCase() : "MEDIUM")
                .status(request.status() != null ? request.status().toUpperCase() : "TODO")
                .type(request.type() != null ? request.type().toUpperCase() : "TASK")
                .storyPoints(request.storyPoints())
                .estimatedHours(request.estimatedHours())
                .startDate(request.startDate())
                .dueDate(request.dueDate())
                .createdBy(principal.getId())
                .build();

        Task saved = taskRepository.save(task);

        List<Long> assigneeIds = new ArrayList<>();
        if (request.assigneeIds() != null) {
            for (Long userId : request.assigneeIds()) {
                TaskAssignee assignee = TaskAssignee.builder()
                        .taskId(saved.getId())
                        .userId(userId)
                        .build();
                taskAssigneeRepository.save(assignee);
                assigneeIds.add(userId);
            }
        }

        return mapToResponse(saved, assigneeIds);
    }

    public List<TaskResponse> getTasks(UserPrincipal principal, Long projectId) {
        List<Task> tasks;

        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .filter(p -> !p.isDeleted())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Project not found or deleted with ID: " + projectId));

            // Permission check: Global Admin OR project member
            if (!isGlobalAdmin(principal) && !isProjectMember(projectId, principal.getId(), project)) {
                throw new IllegalArgumentException("Access denied: You must be a member of the project to view tasks");
            }
            tasks = taskRepository.findByProjectId(projectId);
        } else {
            // Get all tasks user has access to
            if (isGlobalAdmin(principal)) {
                tasks = taskRepository.findAll();
            } else {
                List<Long> myProjectIds = projectMemberRepository.findByUserId(principal.getId()).stream()
                        .map(ProjectMember::getProjectId)
                        .collect(Collectors.toList());
                tasks = taskRepository.findAll().stream()
                        .filter(t -> myProjectIds.contains(t.getProjectId()))
                        .collect(Collectors.toList());
            }
        }

        return tasks.stream()
                .map(t -> {
                    List<Long> assignees = taskAssigneeRepository.findByTaskId(t.getId()).stream()
                            .map(TaskAssignee::getUserId)
                            .collect(Collectors.toList());
                    return mapToResponse(t, assignees);
                })
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(UserPrincipal principal, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException("Access denied: you must be a member of the project to view this task");
        }

        List<Long> assigneeIds = taskAssigneeRepository.findByTaskId(task.getId()).stream()
                .map(TaskAssignee::getUserId)
                .collect(Collectors.toList());

        return mapToResponse(task, assigneeIds);
    }

    @Transactional
    public TaskResponse updateTask(UserPrincipal principal, Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException(
                    "Access denied: You must be a member of the project to update this task");
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setSprintId(request.sprintId());
        task.setMilestoneId(request.milestoneId());
        task.setParentTaskId(request.parentTaskId());
        task.setPriority(request.priority() != null ? request.priority().toUpperCase() : task.getPriority());
        task.setStatus(request.status() != null ? request.status().toUpperCase() : task.getStatus());
        task.setType(request.type() != null ? request.type().toUpperCase() : task.getType());
        task.setStoryPoints(request.storyPoints());
        task.setEstimatedHours(request.estimatedHours());
        task.setStartDate(request.startDate());
        task.setDueDate(request.dueDate());

        Task updated = taskRepository.save(task);

        taskAssigneeRepository.deleteByTaskId(id);

        List<Long> assigneeIds = new java.util.ArrayList<>();

        if (request.assigneeIds() != null) {
            for (Long userId : request.assigneeIds()) {
                TaskAssignee assignee = TaskAssignee.builder()
                        .taskId(updated.getId())
                        .userId(userId)
                        .build();

                taskAssigneeRepository.save(assignee);
                assigneeIds.add(userId);
            }
        }
        return mapToResponse(updated, assigneeIds);
    }

    @Transactional
    public void deleteTask(UserPrincipal principal, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id : " + id));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project  asscociated with this task is deleted or not found"));

        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException(
                    "Access denied: You must be a member of the project to delete this task");
        }

        taskAssigneeRepository.deleteByTaskId(id);
        taskRepository.delete(task);
    }

    private TaskResponse mapToResponse(Task task, List<Long> assigneeIds) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getProjectId(),
                task.getSprintId(),
                task.getMilestoneId(),
                task.getParentTaskId(),
                task.getPriority(),
                task.getStatus(),
                task.getType(),
                task.getStoryPoints(),
                task.getEstimatedHours(),
                task.getActualHours(),
                task.getStartDate(),
                task.getDueDate(),
                task.getCreatedBy(),
                assigneeIds,
                task.getCreatedAt(),
                task.getUpdatedAt());
    }

    private boolean isGlobalAdmin(UserPrincipal principal) {
        return "SUPER_ADMIN".equals(principal.getGlobalRole()) || "ORG_ADMIN".equals(principal.getGlobalRole());
    }

    private boolean isProjectMember(Long projectId, Long userId, Project project) {
        if (project.getOwnerId().equals(userId)
                || (project.getManagerId() != null && project.getManagerId().equals(userId))) {
            return true;
        }
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent();
    }

    @Transactional
    public List<Long> addAssignees(UserPrincipal principal, Long taskId, List<Long> assigneeIds) {
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            throw new IllegalArgumentException("Assignee IDs list cannot be empty");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        // Permission: Project member or Admin
        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException("Access denied: You must be a member of the project to assign users");
        }

        List<Long> currentAssignees = taskAssigneeRepository.findByTaskId(taskId).stream()
                .map(TaskAssignee::getUserId)
                .collect(Collectors.toList());

        List<Long> newlyAdded = new ArrayList<>();
        for (Long userId : assigneeIds) {
            if (!userRepository.existsById(userId)) {
                throw new IllegalArgumentException("User not found with ID: " + userId);
            }

            if (!currentAssignees.contains(userId)) {
                TaskAssignee assignee = TaskAssignee.builder()
                        .taskId(taskId)
                        .userId(userId)
                        .build();
                taskAssigneeRepository.save(assignee);
                newlyAdded.add(userId);
            }
        }

        currentAssignees.addAll(newlyAdded);
        return currentAssignees;
    }

    @Transactional
    public void removeAssignee(UserPrincipal principal, Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        // Permission: Project member or Admin
        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException(
                    "Access denied: You must be a member of the project to remove assignees");
        }

        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskId(taskId);
        TaskAssignee match = assignees.stream()
                .filter(a -> a.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User is not assigned to this task"));

        taskAssigneeRepository.delete(match);
    }

    public List<User> getAssignees(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException("Access denied: You must be a member of the project to view assignees");
        }

        List<Long> assigneeIds = taskAssigneeRepository.findByTaskId(taskId).stream()
                .map(TaskAssignee::getUserId)
                .collect(Collectors.toList());

        return userRepository.findAllById(assigneeIds);
    }

    @Transactional
    public TaskCommentResponse createComment(UserPrincipal principal, Long taskId, TaskCommentRequest request) {
        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted()).orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        if (request.parentCommentId() != null) {
            TaskComment parent = taskCommentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment does not belong to the same task"));
        }

        TaskComment comment = TaskComment.builder()
                .taskId(taskId)
                .userId(principal.getId())
                .content(request.content())
                .parentCommentId(request.parentCommentId())
                .build();

        TaskComment saved = taskCommentRepository.save(comment);

        return mapToCommentResponse(saved);
    }

    public List<TaskCommentResponse> getComments(UserPrincipal principal, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        if (!isGlobalAdmin(principal) && !isProjectMember(task.getProjectId(), principal.getId(), project)) {
            throw new IllegalArgumentException("Access denied: You must be a member of the project to view comments");
        }

        return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskCommentResponse updateComment(UserPrincipal principal, Long commmentId, TaskCommentRequest request) {
        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        TaskComment comment = taskCommentRepository.findById(commmentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with ID: " + commmentId));

        if (!isGlobalAdmin(principal) && !comment.getUserId().equals(principal.getId())) {
            throw new IllegalArgumentException("Access denied: You can only edit uour own comments");
        }

        comment.setContent(request.content());

        TaskComment updated = taskCommentRepository.save(comment);

        return mapToCommentResponse(updated);
    }

    @Transactional
    public void deleteComment(UserPrincipal principal, Long commentId) {
        TaskComment comment = taskCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found with ID: " + commentId));

        Task task = taskRepository.findById(comment.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task associated witn this comment is not found"));

        Project project = projectRepository.findById(task.getProjectId())
                .filter(p -> !p.isDeleted()).orElseThrow(() -> new IllegalArgumentException(
                        "Project associated with this task is deleted or not found"));

        boolean isAuthor = comment.getUserId().equals(principal.getId());

        boolean isProjectAuthority = project.getOwnerId().equals(principal.getId())
                || (project.getManagerId() != null && project.getManagerId().equals(principal.getId()));
        ;

        if (!isGlobalAdmin(principal) && !isAuthor && !isProjectAuthority) {
            throw new IllegalArgumentException("Access denied: You do not have permission to delete this comment");
        }
        List<TaskComment> replies = taskCommentRepository.findByParentCommentId(commentId);

        for (TaskComment reply : replies) {
            deleteComment(principal, reply.getId());
        }

        taskCommentRepository.delete((comment));
    }

    private TaskCommentResponse mapToCommentResponse(TaskComment comment) {
        return new TaskCommentResponse(
                comment.getId(),
                comment.getTaskId(),
                comment.getUserId(),
                comment.getContent(),
                comment.getParentCommentId(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }
}
