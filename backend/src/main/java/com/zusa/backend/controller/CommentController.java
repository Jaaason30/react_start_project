// src/main/java/com/zusa/backend/controller/CommentController.java
package com.zusa.backend.controller;

import com.zusa.backend.dto.post.AddCommentReq;
import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /** 评论列表，带分页、排序及点赞状态 */
    @GetMapping("/posts/{postUuid}/comments")
    public Page<CommentDto> list(
            @PathVariable UUID postUuid,
            @RequestParam(name = "sortType", defaultValue = "LATEST") CommentService.SortType sortType,
            @RequestParam(name = "userUuid", required = false) UUID userUuid,
            Pageable pageable
    ) {
        return commentService.list(postUuid, sortType, pageable, userUuid);
    }

    /** 新增评论 */
    @PostMapping("/posts/{postUuid}/comments")
    public ResponseEntity<CommentDto> add(
            @PathVariable UUID postUuid,
            @RequestBody @Valid AddCommentReq req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID author = principal != null
                ? UUID.fromString(principal.getUsername())
                : req.getAuthorUuid();
        return ResponseEntity.ok(commentService.add(postUuid, author, req.getContent()));
    }

    /** 点赞 / 取消点赞 */
    @PostMapping("/comments/{commentUuid}/likes")
    public ResponseEntity<CommentDto> toggleLike(
            @PathVariable UUID commentUuid,
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(name="userUuid", required=false) UUID userUuid
    ) {
        UUID me = principal != null
                ? UUID.fromString(principal.getUsername())
                : userUuid;
        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(commentService.toggleLike(commentUuid, me));
    }

    /** 单条评论详情，带点赞状态 */
    @GetMapping("/comments/{commentUuid}")
    public ResponseEntity<CommentDto> get(
            @PathVariable UUID commentUuid,
            @RequestParam(name="userUuid", required=false) UUID userUuid
    ) {
        return ResponseEntity.ok(commentService.get(commentUuid, userUuid));
    }

    /** 删除评论（仅作者） */
    @DeleteMapping("/comments/{commentUuid}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID commentUuid,
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(name="userUuid", required=false) UUID userUuid
    ) {
        UUID me = principal != null
                ? UUID.fromString(principal.getUsername())
                : userUuid;
        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        commentService.delete(commentUuid, me);
        return ResponseEntity.noContent().build();
    }
}
