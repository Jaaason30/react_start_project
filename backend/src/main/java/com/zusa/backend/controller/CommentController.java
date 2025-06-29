// src/main/java/com/zusa/backend/controller/CommentController.java

package com.zusa.backend.controller;

import com.zusa.backend.dto.post.AddCommentReq;
import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.service.CommentService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class CommentController {

    private final CommentService commentService;

    /* ==================== 列表 ==================== */
    @GetMapping("/posts/{postUuid}/comments")
    public Page<CommentDto> list(@PathVariable UUID postUuid,
                                 @RequestParam(defaultValue = "LATEST") CommentService.SortType sort,
                                 Pageable pageable) {
        return commentService.list(postUuid, sort, pageable);
    }

    /* ==================== 新增 ==================== */
    @PostMapping("/posts/{postUuid}/comments")
    public ResponseEntity<CommentDto> add(@PathVariable UUID postUuid,
                                          @RequestBody @Validated AddCommentReq req,
                                          @AuthenticationPrincipal UserDetails principal) {

        UUID author;
        if (principal != null) {
            // 登录用户优先
            author = UUID.fromString(principal.getUsername());
        } else if (req.getAuthorUuid() != null) {
            // 支持匿名时传 authorUuid
            author = req.getAuthorUuid();
        } else {
            throw new RuntimeException("未提供用户身份（请登录或指定 authorUuid）");
        }

        CommentDto dto = commentService.add(postUuid, author, req.getContent());
        return ResponseEntity.ok(dto);
    }

    /* ================= 点赞 / 取消点赞 ================ */
    @PostMapping("/comments/{commentUuid}/likes")
    public ResponseEntity<CommentDto> toggleLike(@PathVariable UUID commentUuid,
                                                 @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            throw new RuntimeException("请先登录后再点赞评论");
        }
        UUID me = UUID.fromString(principal.getUsername());
        CommentDto dto = commentService.toggleLike(commentUuid, me);
        return ResponseEntity.ok(dto);
    }

    /* ---------- 可选：若需要提供单条评论详情 ---------- */
    @GetMapping("/comments/{commentUuid}")
    public ResponseEntity<CommentDto> get(@PathVariable UUID commentUuid) {
        CommentDto dto = commentService.get(commentUuid);
        return ResponseEntity.ok(dto);
    }
}
