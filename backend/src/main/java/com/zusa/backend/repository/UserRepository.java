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

    Optional<User> findByUuid(UUID uuid);

    Optional<User> findByNickname(String nickname);

    Optional<User> findByEmail(String email);

    /** 支持 shortId 查找 */
    Optional<User> findByShortId(Long shortId);

    Page<User> findByNicknameContainingIgnoreCase(String keyword, Pageable pageable);

    /** 分页查询粉丝集合 */
    @Query("select u.followers from User u where u.uuid = :uuid")
    Page<User> findFollowersByUuid(@Param("uuid") UUID uuid, Pageable pageable);

    /** 分页查询关注集合 */
    @Query("select u.following from User u where u.uuid = :uuid")
    Page<User> findFollowingByUuid(@Param("uuid") UUID uuid, Pageable pageable);
}
