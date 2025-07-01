// src/main/java/com/zusa/backend/dto/post/PostSummaryDto.java
package com.zusa.backend.dto.post;

import com.zusa.backend.dto.user.UserSummaryDto;
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

    /** 帖子关联的标签列表 */
    private Set<TagDto> tags;

    /**
     * 以下两个字段用于标记“当前登录用户”是否已点赞 / 收藏：
     */
    private boolean likedByMe;
    private boolean collectedByMe;
}
