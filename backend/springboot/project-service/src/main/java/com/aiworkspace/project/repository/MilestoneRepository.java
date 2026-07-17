package com.aiworkspace.project.repository;

import com.aiworkspace.project.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectIdAndDeletedFalse(Long projectId);
}
