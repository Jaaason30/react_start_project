// src/main/java/com/zusa/backend/service/CommentService.java
package com.zusa.backend.service;

import com.zusa.backend.dto.post.CommentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CommentService {

    enum SortType { LATEST, HOT }

    /**
     * 帖子下的一级评论分页拉取
     * @param postUuid 帖子 UUID
     * @param sort 排序类型
     * @param pageable 分页参数
     * @param userUuid 当前用户 UUID（可为 null）
     * @param loadReplies 是否加载回复
     */
    Page<CommentDto> listTopLevel(UUID postUuid, SortType sort, Pageable pageable, UUID userUuid, boolean loadReplies);

    /**
     * 获取某评论的回复列表
     * @param parentCommentUuid 父评论UUID
     * @param pageable 分页参数
     * @param userUuid 当前用户UUID
     */
    Page<CommentDto> listReplies(UUID parentCommentUuid, Pageable pageable, UUID userUuid);

    /**
     * 添加评论或回复
     * @param postUuid 帖子UUID
     * @param authorUuid 作者UUID
     * @param content 内容
     * @param parentCommentUuid 父评论UUID（可为null）
     * @param replyToUserUuid 被回复用户UUID（可为null）
     */
    CommentDto add(UUID postUuid, UUID authorUuid, String content, UUID parentCommentUuid, UUID replyToUserUuid);

    CommentDto toggleLike(UUID commentUuid, UUID userUuid);

    CommentDto get(UUID commentUuid, UUID userUuid);

    void delete(UUID commentUuid, UUID authorUuid);
}