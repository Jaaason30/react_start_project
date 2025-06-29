package com.zusa.backend.dto.user;

import lombok.Data;

import java.util.UUID;

@Data
public class UserSummaryDto {
    /** 对外展示用 UUID */
    private UUID uuid;

    /** 用户昵称 */
    private String nickname;

    /** 头像访问 URL（由 MediaController 提供） */
    private String profilePictureUrl;
}
