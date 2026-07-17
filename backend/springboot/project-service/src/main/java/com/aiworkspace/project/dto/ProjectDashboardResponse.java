package com.aiworkspace.project.dto;

import java.util.List;

public record ProjectDashboardResponse(
        ProjectResponse project,
        Long totalMembers,
        Long totalMilestones,
        List<ProjectActivityResponse> recentActivities) {
}
