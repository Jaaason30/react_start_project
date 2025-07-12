package com.zusa.backend.controller;

import com.zusa.backend.dto.post.PostDetailDto;
import com.zusa.backend.entity.post.Reaction;
import com.zusa.backend.service.PostService;
import com.zusa.backend.service.ReactionService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Validated
public class ReactionController {

    private final ReactionService reactionService;
    private final PostService postService;

    /* ========================================================= */
    /*        切换点赞 / 收藏后直接返回最新帖子详情              */
    /* ========================================================= */
    @PostMapping("/{postUuid}/reactions")
    public ResponseEntity<PostDetailDto> toggle(
            @PathVariable UUID postUuid,
            @RequestBody @Validated ReactionReq req,
            @AuthenticationPrincipal UserDetails principal) {

        // 从 JWT 获取用户 UUID
        UUID userUuid = UUID.fromString(principal.getUsername());

        Reaction.Type type = Reaction.Type.valueOf(req.type.toUpperCase());

        // 1) 执行点赞/收藏切换
        reactionService.toggleReaction(postUuid, userUuid, type);

        // 2) 强制刷新，使事务内数据对后续查询可见
        reactionService.flush();

        // 3) 返回最新帖子详情
        PostDetailDto dto = postService.getDetail(postUuid, userUuid);
        return ResponseEntity.ok(dto);
    }

    /* ========================================================= */
    /*                 查询是否已点赞 / 收藏                     */
    /* ========================================================= */
    @GetMapping("/{postUuid}/reactions/check")
    public ResponseEntity<Boolean> check(
            @PathVariable UUID postUuid,
            @RequestParam @NotBlank String type,
            @AuthenticationPrincipal UserDetails principal) {

        // 从 JWT 获取用户 UUID
        UUID userUuid = UUID.fromString(principal.getUsername());

        Reaction.Type reactionType = Reaction.Type.valueOf(type.toUpperCase());
        boolean has = reactionService.hasReaction(postUuid, userUuid, reactionType);
        return ResponseEntity.ok(has);
    }

    /* ========================================================= */
    /*                     请求体封装                            */
    /* ========================================================= */
    @Value
    public static class ReactionReq {
        @NotBlank String type;       // "LIKE" or "COLLECT"
        // 移除 userUuid，改从 JWT 获取
    }
}