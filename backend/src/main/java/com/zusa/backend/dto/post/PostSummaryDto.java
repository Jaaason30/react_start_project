// src/main/java/com/zusa/backend/dto/post/PostSummaryDto.java
package com.zusa.backend.dto.post;

import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.post.MediaType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
public class PostSummaryDto {
    private UUID uuid;
    private String title;
    private String coverUrl;
    private UserSummaryDto author;
    private long likeCount;
    private long collectCount;
    private long commentCount;
    private LocalDateTime createdAt;

    // [VIDEO-FEED] 开始
    /** 媒体类型：IMAGE 或 VIDEO */
    private MediaType mediaType;
    
    /** 视频元数据（仅当mediaType=VIDEO时存在） */
    private VideoMetadataDto videoMetadata;
    // [VIDEO-FEED] 结束

    /** 帖子关联的标签列表 */
    private Set<TagDto> tags;

    /**
     * 以下三个字段用于标记“当前登录用户”在该帖子上的操作状态：
     * - likedByCurrentUser: 是否已点赞
     * - collectedByCurrentUser: 是否已收藏
     * - followedByCurrentUser: 是否已关注作者
     */
    private boolean likedByCurrentUser;
    private boolean collectedByCurrentUser;
    private boolean followedByCurrentUser;
}
