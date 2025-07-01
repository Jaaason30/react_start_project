// src/main/java/com/zusa/backend/dto/post/PostDetailDto.java
package com.zusa.backend.dto.post;

import lombok.Data;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class PostDetailDto {
    private UUID uuid;
    private String title;
    private String content;
    private List<PostImageDto> images;
    private Set<TagDto> tags;
    private AuthorSummaryDto author;
    private int likeCount;
    private int collectCount;
    private int commentCount;
    private boolean likedByCurrentUser;
    private boolean collectedByCurrentUser;

    /** ★ 新增：当前登录用户是否已关注作者 */
    private boolean followedByCurrentUser;
}
