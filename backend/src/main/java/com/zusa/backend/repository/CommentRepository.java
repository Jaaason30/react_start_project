// src/main/java/com/zusa/backend/repository/CommentRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.post.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 按帖子的 UUID 分页获取评论，由 Pageable 控制排序
     */
    Page<Comment> findByPost_Uuid(UUID postUuid, Pageable pageable);

    /**
     * 查询帖子总评论数
     */
    long countByPost_Uuid(UUID postUuid);

    /**
     * 根据评论 UUID 查找单条评论
     */
    Optional<Comment> findByUuid(UUID uuid);
}
