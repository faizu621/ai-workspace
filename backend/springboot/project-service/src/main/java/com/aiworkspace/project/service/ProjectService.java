package com.aiworkspace.project.service;

import com.aiworkspace.project.dto.ProjectRequest;
import com.aiworkspace.project.dto.ProjectResponse;
import com.aiworkspace.project.dto.ProjectMemberRequest;
import com.aiworkspace.project.dto.ProjectMemberResponse;
import com.aiworkspace.project.model.Project;
import com.aiworkspace.project.model.ProjectMember;
import com.aiworkspace.project.repository.ProjectRepository;
import com.aiworkspace.project.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

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
        
        // Automatically add owner as a member with role "OWNER"
        ProjectMember ownerMember = ProjectMember.builder()
                .projectId(savedProject.getId())
                .userId(savedProject.getOwnerId())
                .role("OWNER")
                .build();
        projectMemberRepository.save(ownerMember);

        // If manager is different, add manager as a member with role "MANAGER"
        if (savedProject.getManagerId() != null && !savedProject.getManagerId().equals(savedProject.getOwnerId())) {
            ProjectMember managerMember = ProjectMember.builder()
                    .projectId(savedProject.getId())
                    .userId(savedProject.getManagerId())
                    .role("MANAGER")
                    .build();
            projectMemberRepository.save(managerMember);
        }

        return mapToResponse(savedProject);
    }

    public List<ProjectResponse> getProjects(Long userId) {
        List<Project> projects;
        if (userId != null) {
            projects = projectRepository.findByOwnerIdOrManagerId(userId, userId);
        } else {
            projects = projectRepository.findAll();
        }
        return projects.stream()
                .filter(project -> !project.isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(Long id) {
        return projectRepository.findById(id)
                .filter(project -> !project.isDeleted())
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found or deleted with ID: " + id));

        if (request.name() != null) project.setName(request.name());
        if (request.description() != null) project.setDescription(request.description());
        if (request.priority() != null) project.setPriority(request.priority());
        if (request.visibility() != null) project.setVisibility(request.visibility());
        if (request.startDate() != null) project.setStartDate(request.startDate());
        if (request.endDate() != null) project.setEndDate(request.endDate());
        if (request.managerId() != null) project.setManagerId(request.managerId());
        if (request.color() != null) project.setColor(request.color());
        if (request.icon() != null) project.setIcon(request.icon());

        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject);
    }

    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found or already deleted with ID: " + id));

        project.setDeleted(true);
        projectRepository.save(project);
    }

    public ProjectMemberResponse addMember(Long projectId, ProjectMemberRequest request) {
        // Ensure project exists
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found or deleted with ID: " + projectId));

        // Ensure user is not already a member
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.userId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .projectId(projectId)
                .userId(request.userId())
                .role(request.role() != null ? request.role() : "MEMBER")
                .build();

        ProjectMember savedMember = projectMemberRepository.save(member);
        return new ProjectMemberResponse(
                savedMember.getId(),
                savedMember.getProjectId(),
                savedMember.getUserId(),
                savedMember.getRole(),
                savedMember.getJoinedAt()
        );
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
                project.getIcon()
        );
    }
}
