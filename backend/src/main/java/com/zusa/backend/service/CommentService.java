// src/main/java/com/zusa/backend/service/CommentService.java

package com.zusa.backend.service;

import com.zusa.backend.dto.post.CommentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CommentService {

    /** 评论排序类型 */
    enum SortType { LATEST, HOT }

    /** ------------------ 帖子下的评论分页拉取 ------------------ */
    Page<CommentDto> list(UUID postUuid,
                          SortType sort,
                          Pageable pageable);

    /** ------------------ 新增评论 ------------------ */
    CommentDto add(UUID postUuid,
                   UUID authorUuid,
                   String content);
    /** ------------------ 点赞 / 取消点赞评论 ------------------ */
    CommentDto toggleLike(UUID commentUuid,
                          UUID userUuid);

    /** ------------------ 获取单条评论详情（用于管理后台/调试） ------------------ */
    CommentDto get(UUID commentUuid);
}
