package com.aiworkspace.project.controller;

import com.aiworkspace.project.config.UserPrincipal;
import com.aiworkspace.project.dto.MilestoneRequest;
import com.aiworkspace.project.dto.MilestoneResponse;
import com.aiworkspace.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final ProjectService projectService;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMilestone(@PathVariable Long id, @RequestBody MilestoneRequest request) {
        try {
            UserPrincipal principal = getCurrentUser();
            MilestoneResponse response = projectService.updateMilestone(principal, id, request);
            return ResponseEntity.ok(response);
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
