package com.aiworkspace.user.service;

import org.springframework.stereotype.Service;

import com.aiworkspace.user.model.User;
import com.aiworkspace.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateProfile(String email, com.aiworkspace.user.dto.UserProfileRequest request) {
        User user = getUserByEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        user.setBio(request.getBio());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setGithubUrl(request.getGithubUrl());
        user.setTwitterUrl(request.getTwitterUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }
}