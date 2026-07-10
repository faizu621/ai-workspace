package com.aiworkspace.project.service;

import com.aiworkspace.project.config.UserPrincipal;
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

    public ProjectResponse createProject(UserPrincipal principal, ProjectRequest request) {
        checkGlobalRoleAllowedToCreate(principal.getGlobalRole());

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
                .ownerId(principal.getId()) // Set creator as ownerId
                .managerId(request.managerId() != null ? request.managerId() : principal.getId())
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

    public List<ProjectResponse> getProjects(UserPrincipal principal, Long filterUserId) {
        List<Project> projects;

        if ("SUPER_ADMIN".equals(principal.getGlobalRole()) || "ORGANIZATION_ADMIN".equals(principal.getGlobalRole())) {
            if (filterUserId != null) {
                projects = projectRepository.findProjectsForUser(filterUserId);
            } else {
                projects = projectRepository.findAll().stream()
                        .filter(p -> !p.isDeleted())
                        .collect(Collectors.toList());
            }
        } else {
            // Normal users only see projects they are members of
            projects = projectRepository.findProjectsForUser(principal.getId());
        }

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProjectById(UserPrincipal principal, Long id) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));

        // Check permission: Global admin OR project member
        if (!isGlobalAdmin(principal) && !isProjectMember(id, principal.getId(), project)) {
            throw new IllegalArgumentException("Access denied to project: " + id);
        }

        return mapToResponse(project);
    }

    public ProjectResponse updateProject(UserPrincipal principal, Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found or deleted with ID: " + id));

        // Permission: Global admin OR Project OWNER/MANAGER
        if (!isGlobalAdmin(principal) && !hasProjectRole(id, principal.getId(), project, "OWNER", "MANAGER")) {
            throw new IllegalArgumentException(
                    "Access denied: Only project Owner or Manager can edit the project details");
        }

        if (request.name() != null)
            project.setName(request.name());
        if (request.description() != null)
            project.setDescription(request.description());
        if (request.priority() != null)
            project.setPriority(request.priority());
        if (request.visibility() != null)
            project.setVisibility(request.visibility());
        if (request.startDate() != null)
            project.setStartDate(request.startDate());
        if (request.endDate() != null)
            project.setEndDate(request.endDate());
        if (request.managerId() != null)
            project.setManagerId(request.managerId());
        if (request.color() != null)
            project.setColor(request.color());
        if (request.icon() != null)
            project.setIcon(request.icon());

        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject);
    }

    public void deleteProject(UserPrincipal principal, Long id) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found or already deleted with ID: " + id));

        // Permission: Global admin OR Project OWNER
        if (!isGlobalAdmin(principal) && !hasProjectRole(id, principal.getId(), project, "OWNER")) {
            throw new IllegalArgumentException("Access denied: Only project Owner can delete the project");
        }

        project.setDeleted(true);
        projectRepository.save(project);
    }

    public ProjectMemberResponse addMember(UserPrincipal principal, Long projectId, ProjectMemberRequest request) {
        // Ensure project exists
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found or deleted with ID: " + projectId));

        // Permission: Global admin OR Project OWNER/MANAGER
        if (!isGlobalAdmin(principal) && !hasProjectRole(projectId, principal.getId(), project, "OWNER", "MANAGER")) {
            throw new IllegalArgumentException("Access denied: Only project Owner or Manager can add members");
        }

        // Ensure user is not already a member
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.userId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .projectId(projectId)
                .userId(request.userId())
                .role(request.role() != null ? request.role().toUpperCase() : "MEMBER")
                .build();

        ProjectMember savedMember = projectMemberRepository.save(member);
        return new ProjectMemberResponse(
                savedMember.getId(),
                savedMember.getProjectId(),
                savedMember.getUserId(),
                savedMember.getRole(),
                savedMember.getJoinedAt());
    }

    public List<ProjectMemberResponse> getProjectMembers(UserPrincipal principal, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found " + projectId));

        if (!isGlobalAdmin(principal) && !isProjectMember(projectId, principal.getId(), project)) {
            throw new IllegalArgumentException(
                    "Access: denied: You must be a member of the project to view the members list");
        }

        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(m -> new ProjectMemberResponse(m.getId(), m.getProjectId(), m.getUserId(), m.getRole(),
                        m.getJoinedAt()))
                .collect(Collectors.toList());
    }

    public void removeProjectMember(UserPrincipal principal, Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId).filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (!isGlobalAdmin(principal) && !hasProjectRole(projectId, principal.getId(), project, "OWNER", "MANAGER")) {
            throw new IllegalArgumentException("Access denied: Only project Owner or Manager can remove members");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found in this project"));

        if ("OWNER".equalsIgnoreCase(member.getRole()) && !isGlobalAdmin(principal)) {
            throw new IllegalArgumentException("Cannot remove the project Owner");
        }

        projectMemberRepository.delete(member);
    }

    // update a project member's role
    public ProjectMemberResponse updateProjectMemberRole(UserPrincipal principal, Long projectId, Long userId,
            String newRole) {
        Project project = projectRepository.findById(projectId).filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("projecy not found: " + projectId));

        if (!isGlobalAdmin(principal) && !hasProjectRole(projectId, principal.getId(), project, "OWNER", "MANAGER")) {
            throw new IllegalArgumentException("Access denied: Only project owner or manager can manager roles");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found in this project"));

        member.setRole(newRole.toUpperCase());

        ProjectMember updated = projectMemberRepository.save(member);

        return new ProjectMemberResponse(updated.getId(), updated.getProjectId(), updated.getUserId(),
                updated.getRole(), updated.getJoinedAt());
    }

    private void checkGlobalRoleAllowedToCreate(String globalRole) {
        if ("CLIENT".equals(globalRole) || "GUEST".equals(globalRole)) {
            throw new IllegalArgumentException("User role '" + globalRole + "' is not permitted to create projects");
        }
    }

    private boolean isGlobalAdmin(UserPrincipal principal) {
        String role = principal.getGlobalRole();
        return "SUPER_ADMIN".equals(role) || "ORGANIZATION_ADMIN".equals(role);
    }

    private boolean isProjectMember(Long projectId, Long userId, Project project) {
        if (userId.equals(project.getOwnerId()) || userId.equals(project.getManagerId())) {
            return true;
        }
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    private boolean hasProjectRole(Long projectId, Long userId, Project project, String... allowedRoles) {
        // Owner ID check
        if (userId.equals(project.getOwnerId())) {
            for (String role : allowedRoles) {
                if ("OWNER".equalsIgnoreCase(role))
                    return true;
            }
        }
        // Manager ID check
        if (userId.equals(project.getManagerId())) {
            for (String role : allowedRoles) {
                if ("MANAGER".equalsIgnoreCase(role))
                    return true;
            }
        }

        // ProjectMember check
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .map(member -> {
                    String userRole = member.getRole().toUpperCase();
                    for (String role : allowedRoles) {
                        if (userRole.equals(role.toUpperCase())) {
                            return true;
                        }
                    }
                    return false;
                }).orElse(false);
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
}
