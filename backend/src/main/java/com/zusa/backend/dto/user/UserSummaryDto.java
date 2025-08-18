// src/main/java/com/zusa/backend/dto/user/UserSummaryDto.java
package com.zusa.backend.dto.user;

import lombok.Data;

import java.util.UUID;

@Data
public class UserSummaryDto {
    /** 短 ID **/
    private Long shortId;

    /** 用户昵称 **/
    private String nickname;

    /** 头像访问 URL **/
    private String profilePictureUrl;
}
