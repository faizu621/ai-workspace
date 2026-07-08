package com.aiworkspace.project.repository;

import com.aiworkspace.project.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByCode(String code);

    boolean existsByCode(String code);

    List<Project> findByOwnerIdOrManagerId(Long ownerId, Long managerId);
}
