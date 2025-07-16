// src/main/java/com/zusa/backend/service/UserService.java
package com.zusa.backend.service;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    // 用户注册 / 登录
    UserDto register(String email, String rawPassword, String nickname);
    UserDto login(String username, String password);

    // UUID 资料查询
    UserDto getUserProfileByUuid(UUID uuid);

    // shortId 资料查询
    UserDto getUserProfileByShortId(Long shortId);

    // UUID 更新资料
    void updateProfilePartially(UserDto req, UUID userUuid);

    // 新增：shortId 更新资料
    void updateProfileByShortId(UserDto req, Long shortId);

    // UUID 关注 / 取关
    void follow(UUID userUuid, UUID targetUuid);
    void unfollow(UUID userUuid, UUID targetUuid);

    // shortId 关注 / 取关
    void followByShortId(UUID userUuid, Long targetShortId);
    void unfollowByShortId(UUID userUuid, Long targetShortId);

    // UUID 粉丝 / 关注列表
    Page<UserSummaryDto> listFollowers(UUID userUuid, Pageable pageable);
    Page<UserSummaryDto> listFollowing(UUID userUuid, Pageable pageable);

    // shortId 粉丝 / 关注列表
    Page<UserSummaryDto> listFollowersByShortId(Long shortId, Pageable pageable);
    Page<UserSummaryDto> listFollowingByShortId(Long shortId, Pageable pageable);

    // 辅助查询
    UserDto getUserByEmail(String email);
    UserDto getUserByUuid(UUID uuid);
}
