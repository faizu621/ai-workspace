package com.aiworkspace.project.repository;

import com.aiworkspace.project.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByCode(String code);

    boolean existsByCode(String code);

    List<Project> findByOwnerIdOrManagerId(Long ownerId, Long managerId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN ProjectMember pm ON pm.projectId = p.id " +
            "WHERE (p.ownerId = :userId OR p.managerId = :userId OR pm.userId = :userId) AND p.deleted = false")
    List<Project> findProjectsForUser(@Param("userId") Long userId);

    @Query("SELECT p FROM Project p WHERE p.deleted = false " +
            "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Project> searchAllProjects(@Param("query") String query);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN ProjectMember pm ON pm.projectId = p.id " +
            "WHERE (p.ownerId = :userId OR p.managerId = :userId OR pm.userId = :userId) AND p.deleted = false " +
            "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Project> searchProjectsForUser(@Param("userId") Long userId, @Param("query") String query);

}
