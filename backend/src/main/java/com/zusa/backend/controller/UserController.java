// src/main/java/com/zusa/backend/controller/UserController.java
package com.zusa.backend.controller;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 原有接口……
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfileByUuid(@RequestParam UUID userUuid) {
        return ResponseEntity.ok(userService.getUserProfileByUuid(userUuid));
    }

    /** 新增：根据 shortId 查询用户 */
    @GetMapping("/profile/short/{shortId}")
    public ResponseEntity<UserDto> getProfileByShortId(@PathVariable Long shortId) {
        return ResponseEntity.ok(userService.getUserProfileByShortId(shortId));
    }

    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfilePartially(@RequestBody UserDto req,
                                                       @RequestParam UUID userUuid) {
        userService.updateProfilePartially(req, userUuid);
        return ResponseEntity.ok().build();
    }

    // ----- 关注／取消关注 -----
    @PostMapping("/follow")
    public ResponseEntity<Void> follow(@RequestParam UUID userUuid,
                                       @RequestParam UUID targetUuid) {
        userService.follow(userUuid, targetUuid);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/follow")
    public ResponseEntity<Void> unfollow(@RequestParam UUID userUuid,
                                         @RequestParam UUID targetUuid) {
        userService.unfollow(userUuid, targetUuid);
        return ResponseEntity.ok().build();
    }

    // ----- 获取粉丝列表 -----
    @GetMapping("/followers")
    public ResponseEntity<Page<UserSummaryDto>> getFollowers(@RequestParam UUID userUuid,
                                                             Pageable pageable) {
        Page<UserSummaryDto> page = userService.listFollowers(userUuid, pageable);
        return ResponseEntity.ok(page);
    }

    // ----- 获取关注列表 -----
    @GetMapping("/following")
    public ResponseEntity<Page<UserSummaryDto>> getFollowing(@RequestParam UUID userUuid,
                                                             Pageable pageable) {
        Page<UserSummaryDto> page = userService.listFollowing(userUuid, pageable);
        return ResponseEntity.ok(page);
    }
}
