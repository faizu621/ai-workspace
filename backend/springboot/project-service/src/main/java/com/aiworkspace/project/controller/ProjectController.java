package com.aiworkspace.project.controller;

import com.aiworkspace.project.config.UserPrincipal;
import com.aiworkspace.project.dto.ProjectRequest;
import com.aiworkspace.project.dto.ProjectResponse;
import com.aiworkspace.project.model.Milestone;
import com.aiworkspace.project.model.User;
import com.aiworkspace.project.dto.MilestoneRequest;
import com.aiworkspace.project.dto.MilestoneResponse;
import com.aiworkspace.project.dto.ProjectMemberRequest;
import com.aiworkspace.project.dto.ProjectMemberResponse;
import com.aiworkspace.project.dto.ProjectActivityResponse;
import com.aiworkspace.project.dto.ProjectStatisticsResponse;
import com.aiworkspace.project.dto.ProjectDashboardResponse;
import com.aiworkspace.project.dto.ProjectSettingsResponse;
import com.aiworkspace.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import java.util.Map;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectRequest request) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectResponse response = projectService.createProject(principal, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getProjects(@RequestParam(required = false) Long userId) {
        try {
            UserPrincipal principal = getCurrentUser();
            java.util.List<ProjectResponse> projects = projectService.getProjects(principal, userId);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectResponse project = projectService.getProjectById(principal, id);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectRequest request) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectResponse response = projectService.updateProject(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            projectService.deleteProject(principal, id);
            return ResponseEntity.ok(Map.of("message", "Project soft-deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id, @RequestBody ProjectMemberRequest request) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectMemberResponse response = projectService.addMember(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getProjectMembers(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();

            List<ProjectMemberResponse> members = projectService.getProjectMembers(principal, id);

            return ResponseEntity.ok(members);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeProjectMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            UserPrincipal principal = getCurrentUser();

            projectService.removeProjectMember(principal, id, userId);

            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<?> updateProjectMemberRole(@PathVariable Long id, @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        try {
            String role = body.get("role");
            if (role == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role parameter is required"));
            }

            UserPrincipal principal = getCurrentUser();

            ProjectMemberResponse response = projectService.updateProjectMemberRole(principal, id, userId, role);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<?> createMilestone(@PathVariable Long id, @RequestBody MilestoneRequest request) {
        try {
            UserPrincipal principal = getCurrentUser();
            MilestoneResponse response = projectService.createMilestone(principal, id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}/milestones")
    public ResponseEntity<?> getMilestones(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();

            List<MilestoneResponse> responses = projectService.getMilestones(principal, id);

            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<?> getProjectActivities(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            List<ProjectActivityResponse> responses = projectService.getProjectActivities(principal, id);
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<?> archiveProject(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectResponse response = projectService.archiveProject(principal, id);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<?> restoreProject(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectResponse response = projectService.restoreProject(principal, id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            UserPrincipal principal = getCurrentUser();
            ProjectResponse response = projectService.updateProjectStatus(principal, id, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProjects(@RequestParam String query) {
        try {
            UserPrincipal principal = getCurrentUser();
            List<ProjectResponse> projects = projectService.searchProjects(principal, query);
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getProjectStatistics() {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectStatisticsResponse stats = projectService.getProjectStatistics(principal);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> getProjectDashboard(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectDashboardResponse dashboard = projectService.getProjectDashboard(principal, id);
            return ResponseEntity.ok(dashboard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}/settings")
    public ResponseEntity<?> getProjectSettings(@PathVariable Long id) {
        try {
            UserPrincipal principal = getCurrentUser();
            ProjectSettingsResponse settings = projectService.getProjectSettings(principal, id);
            return ResponseEntity.ok(settings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
