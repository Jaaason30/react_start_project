// src/main/java/com/zusa/backend/repository/UserRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.User;
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

    /**
     * 根据昵称精确查找
     */
    Optional<User> findByNickname(String nickname);

    /**
     * 根据 email 查找
     */
    Optional<User> findByEmail(String email);

    /**
     * 根据短 ID 查找
     */
    Optional<User> findByShortId(Long shortId);

    /**
     * 模糊搜索昵称（大小写不敏感）
     */
    Page<User> findByNicknameContainingIgnoreCase(String keyword, Pageable pageable);

    /**
     * 查询某用户的粉丝列表
     */
    @Query("select u.followers from User u where u.uuid = :uuid")
    Page<User> findFollowersByUuid(@Param("uuid") UUID uuid, Pageable pageable);

    /**
     * 查询某用户的关注列表
     */
    @Query("select u.following from User u where u.uuid = :uuid")
    Page<User> findFollowingByUuid(@Param("uuid") UUID uuid, Pageable pageable);

}
