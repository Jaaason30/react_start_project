// src/main/java/com/zusa/backend/dto/post/PostDetailDto.java
package com.zusa.backend.dto.post;

import com.zusa.backend.dto.user.UserSummaryDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class PostDetailDto {
    private UUID uuid;
    private String title;
    private String content;
    private String coverUrl;
    private UserSummaryDto author;
    private List<PostImageDto> images;
    private Set<TagDto> tags;

    private long likeCount;
    private long collectCount;
    private long commentCount;
    private LocalDateTime createdAt;

    /**
     * 以下两个字段用于标记“当前登录用户”是否已点赞 / 收藏：
     */
    private boolean likedByMe;
    private boolean collectedByMe;
}
