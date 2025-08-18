// src/main/java/com/zusa/backend/dto/post/AuthorSummaryDto.java
package com.zusa.backend.dto.post;

import lombok.Data;

import java.util.UUID;

@Data
public class AuthorSummaryDto {
    /** 短 ID **/
    private Long shortId;

    /** 对外展示用 UUID **/
    private UUID uuid;

    /** 用户昵称 **/
    private String nickname;

    /** 头像访问 URL **/
    private String profilePictureUrl;
}