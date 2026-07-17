package com.aiworkspace.project.dto;

import java.util.Map;

public record ProjectStatisticsResponse(
        Long totalProjects,
        Long activeProjects,
        Long archiveProjects,
        Map<String, Long> statusDistribution) {
}
