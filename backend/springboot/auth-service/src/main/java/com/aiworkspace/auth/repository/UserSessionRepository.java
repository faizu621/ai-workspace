package com.aiworkspace.auth.repository;

import com.aiworkspace.auth.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUserEmail(String email);
}
