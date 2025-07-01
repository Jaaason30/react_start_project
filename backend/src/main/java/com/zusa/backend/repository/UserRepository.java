// src/main/java/com/zusa/backend/repository/UserRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.User;   // ✅ 一定要导入 entity 下的 User
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    @Query("select u.followers from User u where u.uuid = :uuid")
    Page<User> findFollowersByUuid(@Param("uuid") UUID uuid, Pageable pageable);

    @Query("select u.following from User u where u.uuid = :uuid")
    Page<User> findFollowingByUuid(@Param("uuid") UUID uuid, Pageable pageable);

}
