package com.zusa.backend.service;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    /**
     * 用户注册
     */
    UserDto register(String email, String rawPassword, String nickname);

    /**
     * 用户登录（已简化，实际认证在Controller中处理）
     */
    UserDto login(String username, String password);

    /**
     * 根据 UUID 查询用户资料
     */
    UserDto getUserProfileByUuid(UUID uuid);

    /**
     * 根据 shortId 查询用户资料
     */
    UserDto getUserProfileByShortId(Long shortId);

    /**
     * 关注用户（使用 UUID）
     */
    void follow(UUID userUuid, UUID targetUuid);

    /**
     * 取消关注（使用 UUID）
     */
    void unfollow(UUID userUuid, UUID targetUuid);

    /**
     * 获取粉丝列表（使用 UUID）
     */
    Page<UserSummaryDto> listFollowers(UUID userUuid, Pageable pageable);

    /**
     * 获取关注列表（使用 UUID）
     */
    Page<UserSummaryDto> listFollowing(UUID userUuid, Pageable pageable);

    /**
     * 部分更新用户资料
     */
    void updateProfilePartially(UserDto req, UUID userUuid);

    /**
     * 通过邮箱获取用户信息 - JWT 认证需要
     */
    UserDto getUserByEmail(String email);

    /**
     * 通过 UUID 获取用户信息 - JWT 刷新 token 需要
     */
    UserDto getUserByUuid(UUID uuid);

    // ==================== 新增 shortId 支持 ====================

    /**
     * 关注用户（使用 shortId）
     */
    void followByShortId(UUID userUuid, Long targetShortId);

    /**
     * 取消关注（使用 shortId）
     */
    void unfollowByShortId(UUID userUuid, Long targetShortId);

    /**
     * 获取指定 shortId 用户的粉丝列表
     */
    Page<UserSummaryDto> listFollowersByShortId(Long shortId, Pageable pageable);

    /**
     * 获取指定 shortId 用户的关注列表
     */
    Page<UserSummaryDto> listFollowingByShortId(Long shortId, Pageable pageable);
}
