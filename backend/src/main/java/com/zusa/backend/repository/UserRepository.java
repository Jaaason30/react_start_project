// src/main/java/com/zusa/backend/repository/UserRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, Long> {

    // ———— 基本查询 ————
    Optional<User> findByUuid(UUID uuid);

    Optional<User> findByShortId(Long shortId);

    Optional<User> findByNickname(String nickname);

    Optional<User> findByEmail(String email);
    boolean existsByShortId(Long shortId);
    Page<User> findByNicknameContainingIgnoreCase(String keyword, Pageable pageable);

    // ———— 基于 UUID 的粉丝/关注查询（保持兼容） ————
    @Query("SELECT f FROM User u JOIN u.followers f WHERE u.uuid = :uuid")
    Page<User> findFollowersByUuid(@Param("uuid") UUID uuid, Pageable pageable);

    @Query("SELECT f FROM User u JOIN u.following f WHERE u.uuid = :uuid")
    Page<User> findFollowingByUuid(@Param("uuid") UUID uuid, Pageable pageable);

    // ———— 基于 shortId 的粉丝/关注查询 ————
    @Query("SELECT f FROM User u JOIN u.followers f WHERE u.shortId = :shortId")
    Page<User> findFollowersByShortId(@Param("shortId") Long shortId, Pageable pageable);

    @Query("SELECT f FROM User u JOIN u.following f WHERE u.shortId = :shortId")
    Page<User> findFollowingByShortId(@Param("shortId") Long shortId, Pageable pageable);
}
