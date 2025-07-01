// src/main/java/com/zusa/backend/service/CommentService.java
package com.zusa.backend.service;

import com.zusa.backend.dto.post.CommentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CommentService {

    enum SortType { LATEST, HOT }

    /**
     * 帖子下的评论分页拉取
     * @param postUuid 帖子 UUID
     * @param sort 排序类型
     * @param pageable 分页参数
     * @param userUuid 当前用户 UUID（可为 null）
     */
    Page<CommentDto> list(UUID postUuid, SortType sort, Pageable pageable, UUID userUuid);

    CommentDto add(UUID postUuid, UUID authorUuid, String content);

    CommentDto toggleLike(UUID commentUuid, UUID userUuid);

    /**
     * 获取单条评论详情
     * @param commentUuid 评论 UUID
     * @param userUuid 当前用户 UUID（可为 null）
     */
    CommentDto get(UUID commentUuid, UUID userUuid);

    void delete(UUID commentUuid, UUID authorUuid);
}
