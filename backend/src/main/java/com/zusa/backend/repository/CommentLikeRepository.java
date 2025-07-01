// src/main/java/com/zusa/backend/repository/CommentLikeRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.post.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    Optional<CommentLike> findByComment_UuidAndUser_Uuid(UUID commentUuid, UUID userUuid);

    long countByComment_Uuid(UUID commentUuid);

    // 新增：批量查询某用户对一组评论的点赞记录
    List<CommentLike> findAllByUser_UuidAndComment_UuidIn(UUID userUuid, Collection<UUID> commentUuids);
}
