// src/main/java/com/zusa/backend/repository/UserProfilePictureRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.user.UserProfilePicture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfilePictureRepository extends JpaRepository<UserProfilePicture, Long> {
    Optional<UserProfilePicture> findByUuid(UUID uuid);
}
