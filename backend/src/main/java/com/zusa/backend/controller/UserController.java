// src/main/java/com/zusa/backend/controller/UserController.java
package com.zusa.backend.controller;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /me — UUID = {}", currentUuid);
        return ResponseEntity.ok(userService.getUserProfileByUuid(currentUuid));
    }

    /** 更新当前用户资料 */
    @PatchMapping("/me")
    public ResponseEntity<Void> updateMyProfile(
            @RequestBody UserDto req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] PATCH /me — UUID = {}", currentUuid);
        userService.updateProfilePartially(req, currentUuid);
        return ResponseEntity.ok().build();
    }

    /** 获取当前用户的粉丝列表 */
    @GetMapping("/me/followers")
    public ResponseEntity<Page<UserSummaryDto>> getMyFollowers(
            @AuthenticationPrincipal UserDetails principal,
            Pageable pageable
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /me/followers — UUID = {}", currentUuid);
        return ResponseEntity.ok(userService.listFollowers(currentUuid, pageable));
    }

    /** 获取当前用户的关注列表 */
    @GetMapping("/me/following")
    public ResponseEntity<Page<UserSummaryDto>> getMyFollowing(
            @AuthenticationPrincipal UserDetails principal,
            Pageable pageable
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /me/following — UUID = {}", currentUuid);
        return ResponseEntity.ok(userService.listFollowing(currentUuid, pageable));
    }

    // ==================== 旧 UUID 接口（@Deprecated） ====================

    @Deprecated
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfileByUuid(
            @RequestParam("userUuid") UUID userUuid
    ) {
        log.warn("[Deprecated] GET /profile — userUuid = {}", userUuid);
        return ResponseEntity.ok(userService.getUserProfileByUuid(userUuid));
    }

    @Deprecated
    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfilePartially(
            @RequestBody UserDto req,
            @RequestParam("userUuid") UUID userUuid
    ) {
        log.warn("[Deprecated] PATCH /profile — userUuid = {}", userUuid);
        userService.updateProfilePartially(req, userUuid);
        return ResponseEntity.ok().build();
    }

    @Deprecated
    @GetMapping("/followers")
    public ResponseEntity<Page<UserSummaryDto>> getFollowers(
            @RequestParam("userUuid") UUID userUuid,
            Pageable pageable
    ) {
        log.warn("[Deprecated] GET /followers — userUuid = {}", userUuid);
        return ResponseEntity.ok(userService.listFollowers(userUuid, pageable));
    }

    @Deprecated
    @GetMapping("/following")
    public ResponseEntity<Page<UserSummaryDto>> getFollowing(
            @RequestParam("userUuid") UUID userUuid,
            Pageable pageable
    ) {
        log.warn("[Deprecated] GET /following — userUuid = {}", userUuid);
        return ResponseEntity.ok(userService.listFollowing(userUuid, pageable));
    }

    @Deprecated
    @PostMapping("/follow")
    public ResponseEntity<Void> follow(
            @RequestParam("userUuid") UUID userUuid,
            @RequestParam("targetUuid") UUID targetUuid
    ) {
        log.warn("[Deprecated] POST /follow — userUuid = {}, targetUuid = {}", userUuid, targetUuid);
        userService.follow(userUuid, targetUuid);
        return ResponseEntity.ok().build();
    }

    @Deprecated
    @DeleteMapping("/follow")
    public ResponseEntity<Void> unfollow(
            @RequestParam("userUuid") UUID userUuid,
            @RequestParam("targetUuid") UUID targetUuid
    ) {
        log.warn("[Deprecated] DELETE /follow — userUuid = {}, targetUuid = {}", userUuid, targetUuid);
        userService.unfollow(userUuid, targetUuid);
        return ResponseEntity.ok().build();
    }

    // ==================== 新 shortId 接口 ====================

    /** 根据 shortId 查询用户资料 */
    @GetMapping("/profile/short/{shortId}")
    public ResponseEntity<UserDto> getProfileByShortId(
            @PathVariable("shortId") Long shortId
    ) {
        log.info("[Controller] GET /profile/short/{} — shortId = {}", shortId, shortId);
        return ResponseEntity.ok(userService.getUserProfileByShortId(shortId));
    }

    /** 更新指定 shortId 用户资料 */
    @PatchMapping("/profile/short/{shortId}")
    public ResponseEntity<Void> updateProfileByShortId(
            @PathVariable("shortId") Long shortId,
            @RequestBody UserDto req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        log.info("yaaa");
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] PATCH /profile/short/{} — current UUID = {}", shortId, currentUuid);
        userService.updateProfileByShortId(req, shortId);
        return ResponseEntity.ok().build();
    }

    /** 关注用户（使用 shortId，当前用户从 JWT 提取） */
    @PostMapping("/follow/{targetShortId}")
    public ResponseEntity<Void> followByShortId(
            @PathVariable("targetShortId") Long targetShortId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] POST /follow/{} — current UUID = {}", targetShortId, currentUuid);
        userService.followByShortId(currentUuid, targetShortId);
        return ResponseEntity.ok().build();
    }

    /** 取消关注（使用 shortId，当前用户从 JWT 提取） */
    @DeleteMapping("/follow/{targetShortId}")
    public ResponseEntity<Void> unfollowByShortId(
            @PathVariable("targetShortId") Long targetShortId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] DELETE /follow/{} — current UUID = {}", targetShortId, currentUuid);
        userService.unfollowByShortId(currentUuid, targetShortId);
        return ResponseEntity.ok().build();
    }

    /** 获取指定 shortId 用户的粉丝列表 */
    @GetMapping("/{shortId}/followers")
    public ResponseEntity<Page<UserSummaryDto>> getFollowersByShortId(
            @PathVariable("shortId") Long shortId,
            Pageable pageable
    ) {
        log.info("[Controller] GET /{}/followers — shortId = {}", shortId, shortId);
        return ResponseEntity.ok(userService.listFollowersByShortId(shortId, pageable));
    }

    /** 获取指定 shortId 用户的关注列表 */
    @GetMapping("/{shortId}/following")
    public ResponseEntity<Page<UserSummaryDto>> getFollowingByShortId(
            @PathVariable("shortId") Long shortId,
            Pageable pageable
    ) {
        log.info("[Controller] GET /{}/following — shortId = {}", shortId, shortId);
        return ResponseEntity.ok(userService.listFollowingByShortId(shortId, pageable));
    }
}
