package com.zusa.backend.controller;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    // ==================== 当前用户 /me 端点 ====================

    /** 获取当前登录用户信息（从 JWT 提取） */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
            @AuthenticationPrincipal UserDetails principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /me — current UUID = {}", userUuid);
        return ResponseEntity.ok(userService.getUserProfileByUuid(userUuid));
    }

    /** 更新当前用户资料 */
    @PatchMapping("/me")
    public ResponseEntity<Void> updateMyProfile(
            @RequestBody UserDto req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] PATCH /me — update UUID = {}", userUuid);
        userService.updateProfilePartially(req, userUuid);
        return ResponseEntity.ok().build();
    }

    /** 获取当前用户的粉丝列表 */
    @GetMapping("/me/followers")
    public ResponseEntity<Page<UserSummaryDto>> getMyFollowers(
            @AuthenticationPrincipal UserDetails principal,
            Pageable pageable
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /me/followers — UUID = {}", userUuid);
        Page<UserSummaryDto> page = userService.listFollowers(userUuid, pageable);
        return ResponseEntity.ok(page);
    }

    /** 获取当前用户的关注列表 */
    @GetMapping("/me/following")
    public ResponseEntity<Page<UserSummaryDto>> getMyFollowing(
            @AuthenticationPrincipal UserDetails principal,
            Pageable pageable
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /me/following — UUID = {}", userUuid);
        Page<UserSummaryDto> page = userService.listFollowing(userUuid, pageable);
        return ResponseEntity.ok(page);
    }

    // ==================== 按 UUID 的旧接口（保持兼容） ====================

    /** 根据 UUID 查询用户资料 */
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfileByUuid(
            @RequestParam("userUuid") UUID userUuid
    ) {
        log.info("[Controller] GET /profile — userUuid = {}", userUuid);
        return ResponseEntity.ok(userService.getUserProfileByUuid(userUuid));
    }

    /** 更新指定 UUID 用户资料 */
    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfilePartially(
            @RequestBody UserDto req,
            @RequestParam("userUuid") UUID userUuid
    ) {
        log.info("[Controller] PATCH /profile — userUuid = {}", userUuid);
        userService.updateProfilePartially(req, userUuid);
        return ResponseEntity.ok().build();
    }

    /** 获取指定 UUID 用户的粉丝列表 */
    @GetMapping("/followers")
    public ResponseEntity<Page<UserSummaryDto>> getFollowers(
            @RequestParam("userUuid") UUID userUuid,
            Pageable pageable
    ) {
        log.info("[Controller] GET /followers — userUuid = {}", userUuid);
        Page<UserSummaryDto> page = userService.listFollowers(userUuid, pageable);
        return ResponseEntity.ok(page);
    }

    /** 获取指定 UUID 用户的关注列表 */
    @GetMapping("/following")
    public ResponseEntity<Page<UserSummaryDto>> getFollowing(
            @RequestParam("userUuid") UUID userUuid,
            Pageable pageable
    ) {
        log.info("[Controller] GET /following — userUuid = {}", userUuid);
        Page<UserSummaryDto> page = userService.listFollowing(userUuid, pageable);
        return ResponseEntity.ok(page);
    }

    /** 关注用户（使用 UUID） */
    @PostMapping("/follow")
    public ResponseEntity<Void> follow(
            @RequestParam("userUuid") UUID userUuid,
            @RequestParam("targetUuid") UUID targetUuid
    ) {
        log.info("[Controller] POST /follow — userUuid = {}, targetUuid = {}", userUuid, targetUuid);
        userService.follow(userUuid, targetUuid);
        return ResponseEntity.ok().build();
    }

    /** 取消关注（使用 UUID） */
    @DeleteMapping("/follow")
    public ResponseEntity<Void> unfollow(
            @RequestParam("userUuid") UUID userUuid,
            @RequestParam("targetUuid") UUID targetUuid
    ) {
        log.info("[Controller] DELETE /follow — userUuid = {}, targetUuid = {}", userUuid, targetUuid);
        userService.unfollow(userUuid, targetUuid);
        return ResponseEntity.ok().build();
    }

    /** 根据 shortId 查询用户资料 */
    @GetMapping("/profile/short/{shortId}")
    public ResponseEntity<UserDto> getProfileByShortId(
            @PathVariable("shortId") Long shortId
    ) {
        log.info("[Controller] GET /profile/short/{}, shortId = {}", shortId, shortId);
        return ResponseEntity.ok(userService.getUserProfileByShortId(shortId));
    }

    // ==================== 新增 shortId 接口 ====================

    /** 关注用户（使用 shortId，当前用户从 JWT 提取） */
    @PostMapping("/follow/{targetShortId}")
    public ResponseEntity<Void> followByShortId(
            @PathVariable("targetShortId") Long targetShortId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] POST /follow/{} — current UUID = {}", targetShortId, userUuid);
        userService.followByShortId(userUuid, targetShortId);
        return ResponseEntity.ok().build();
    }

    /** 取消关注（使用 shortId，当前用户从 JWT 提取） */
    @DeleteMapping("/follow/{targetShortId}")
    public ResponseEntity<Void> unfollowByShortId(
            @PathVariable("targetShortId") Long targetShortId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] DELETE /follow/{} — current UUID = {}", targetShortId, userUuid);
        userService.unfollowByShortId(userUuid, targetShortId);
        return ResponseEntity.ok().build();
    }

    /** 获取指定 shortId 用户的粉丝列表 */
    @GetMapping("/{shortId}/followers")
    public ResponseEntity<Page<UserSummaryDto>> getFollowersByShortId(
            @PathVariable("shortId") Long shortId,
            Pageable pageable
    ) {
        log.info("[Controller] GET /{}/followers — shortId = {}", shortId, shortId);
        Page<UserSummaryDto> page = userService.listFollowersByShortId(shortId, pageable);
        return ResponseEntity.ok(page);
    }

    /** 获取指定 shortId 用户的关注列表 */
    @GetMapping("/{shortId}/following")
    public ResponseEntity<Page<UserSummaryDto>> getFollowingByShortId(
            @PathVariable("shortId") Long shortId,
            Pageable pageable
    ) {
        log.info("[Controller] GET /{}/following — shortId = {}", shortId, shortId);
        Page<UserSummaryDto> page = userService.listFollowingByShortId(shortId, pageable);
        return ResponseEntity.ok(page);
    }

}
