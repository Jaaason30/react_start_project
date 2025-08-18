// src/main/java/com/zusa/backend/repository/CommentRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.post.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 按帖子的 UUID 分页获取一级评论（parentComment为null）
     */
    @Query("SELECT c FROM Comment c WHERE c.post.uuid = :postUuid AND c.parentComment IS NULL")
    Page<Comment> findTopLevelCommentsByPostUuid(@Param("postUuid") UUID postUuid, Pageable pageable);

    /**
     * 获取某评论的所有子评论
     */
    Page<Comment> findByParentComment_Uuid(UUID parentUuid, Pageable pageable);

    /**
     * 获取某评论的所有子评论（不分页）
     */
    List<Comment> findByParentComment_UuidOrderByCreatedAtAsc(UUID parentUuid);

    /**
     * 查询帖子总评论数（包括回复）
     */
    long countByPost_Uuid(UUID postUuid);

    /**
     * 根据评论 UUID 查找单条评论
     */
    Optional<Comment> findByUuid(UUID uuid);
}