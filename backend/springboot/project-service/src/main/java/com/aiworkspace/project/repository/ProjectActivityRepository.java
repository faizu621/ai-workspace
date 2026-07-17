package com.aiworkspace.project.repository;

import com.aiworkspace.project.model.ProjectActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long> {
    List<ProjectActivity> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
