package com.zusa.backend.service;

import com.zusa.backend.dto.post.ReactionDto;
import com.zusa.backend.entity.post.Reaction;

import java.util.UUID;

/**
 * 点赞 / 收藏 业务接口
 */
public interface ReactionService {

    /**
     * 切换（添加/取消）点赞 或 收藏。
     *
     * @param postUuid 帖子 UUID
     * @param userUuid 当前用户 UUID
     * @param type     LIKE / COLLECT
     * @return 结果 DTO，字段 createdAt 仅在“新增”时有意义
     */
    ReactionDto toggleReaction(UUID postUuid,
                               UUID userUuid,
                               Reaction.Type type);

    /**
     * 判断当前用户是否已对该帖子做过某种 Reaction
     */
    boolean hasReaction(UUID postUuid,
                        UUID userUuid,
                        Reaction.Type type);

    /**
     * 强制刷新，使得事务内最新状态可被后续查询可见
     */
    void flush();
}
