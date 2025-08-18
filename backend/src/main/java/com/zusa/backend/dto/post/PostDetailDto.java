// src/main/java/com/zusa/backend/dto/post/PostDetailDto.java
package com.zusa.backend.dto.post;

import com.zusa.backend.entity.post.MediaType;
import lombok.Data;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class PostDetailDto {
    private UUID uuid;
    private String title;
    private String content;
    
    // [VIDEO-DETAIL] 开始
    /** 媒体类型：IMAGE 或 VIDEO */
    private MediaType mediaType;
    
    /** 图片列表（仅当mediaType=IMAGE时存在） */
    private List<PostImageDto> images;
    
    /** 视频播放URL（仅当mediaType=VIDEO时存在） */
    private String videoUrl;
    
    /** 视频封面URL（仅当mediaType=VIDEO时存在） */
    private String videoCoverUrl;
    
    /** 视频元数据（仅当mediaType=VIDEO时存在） */
    private VideoMetadataDto videoMetadata;
    // [VIDEO-DETAIL] 结束
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
