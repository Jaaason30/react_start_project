package com.zusa.backend.service;

import com.zusa.backend.dto.post.PostDetailDto;
import com.zusa.backend.dto.post.PostSummaryDto;
import com.zusa.backend.service.model.CreatePostCmd;
import com.zusa.backend.service.model.EditPostCmd;
import com.zusa.backend.service.model.FeedType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PostService {

    /** Feed 列表 */
    Page<PostSummaryDto> listFeed(FeedType type,
                                  UUID currentUserUuid,
                                  Pageable pageable);

    /** 详情 */
    PostDetailDto getDetail(UUID postUuid,
                            UUID currentUserUuid);

    /** 创建帖子，返回帖子的外部 UUID */
    UUID createPost(CreatePostCmd cmd, UUID authorUuid);

    /** 编辑（仅作者 / 管理员） */
    void editPost(EditPostCmd cmd, UUID authorUuid);

    /** 删除（仅作者 / 管理员） */
    void deletePost(UUID postUuid, UUID operatorUuid);
}
