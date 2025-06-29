// src/main/java/com/zusa/backend/repository/UserRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.User;   // ✅ 一定要导入 entity 下的 User
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * 根据用户的 UUID 查找
     */
    Optional<User> findByUuid(UUID uuid);
    Optional<User> findByNickname(String nickname);

    /**
     * 根据 email 查找
     */
    Optional<User> findByEmail(String email);
}
