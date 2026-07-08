package com.aiworkspace.project.service;

import com.aiworkspace.project.dto.ProjectRequest;
import com.aiworkspace.project.dto.ProjectResponse;
import com.aiworkspace.project.model.Project;
import com.aiworkspace.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectResponse createProject(ProjectRequest request) {
        if (projectRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("Project code already exists: " + request.code());
        }

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .code(request.code())
                .status("PLANNED")
                .priority(request.priority() != null ? request.priority() : "MEDIUM")
                .visibility(request.visibility() != null ? request.visibility() : "INTERNAL")
                .startDate(request.startDate())
                .endDate(request.endDate())
                .ownerId(request.ownerId())
                .managerId(request.managerId())
                .color(request.color())
                .icon(request.icon())
                .build();

        Project savedProject = projectRepository.save(project);
        return mapToResponse(savedProject);
    }

    private ProjectResponse mapToResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCode(),
                project.getStatus(),
                project.getPriority(),
                project.getVisibility(),
                project.getStartDate(),
                project.getEndDate(),
                project.getOwnerId(),
                project.getManagerId(),
                project.isArchived(),
                project.getColor(),
                project.getIcon());
    }

    public java.util.List<ProjectResponse> getProjects(Long userId) {
        java.util.List<Project> projects;

        if (userId != null) {
            projects = projectRepository.findByOwnerIdOrManagerId(userId, userId);
        } else {
            projects = projectRepository.findAll();
        }
        return projects.stream().filter(project -> !project.isDeleted())
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        return projectRepository.findById(id)
                .filter(project -> !project.isDeleted())
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }
}
