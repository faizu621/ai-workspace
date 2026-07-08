package com.aiworkspace.project.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String priority;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "estimated_completion")
    private LocalDateTime estimatedCompletion;

    private String color;
    private String icon;

    @Column(nullable = false)
    private String visibility;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "manager_id", nullable = false)
    private Long managerId;

    @Builder.Default
    private boolean archived = false;

    @Builder.Default
    private boolean deleted = false;

}
