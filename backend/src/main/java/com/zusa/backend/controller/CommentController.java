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

    /* ① 帖子一级评论列表  --------------------------------------------- */
    @GetMapping("/posts/{postUuid}/comments")
    public Page<CommentDto> listTopLevel(
            @PathVariable UUID postUuid,
            @RequestParam(name = "sortType", defaultValue = "LATEST") CommentService.SortType sortType,
            @AuthenticationPrincipal UserDetails principal,                 // ← 加上
            @RequestParam(name = "userUuid", required = false) UUID userUuid,
            @RequestParam(name = "loadReplies", defaultValue = "false") boolean loadReplies,
            Pageable pageable) {

        /* 统一求出 “有效用户 UUID” —— 登录优先，参数兜底 */
        UUID effectiveUserUuid = principal != null
                ? UUID.fromString(principal.getUsername())
                : userUuid;

        Page<CommentDto> result = commentService.listTopLevel(
                postUuid, sortType, pageable,
                effectiveUserUuid,
                loadReplies);

        System.out.println("[🧩 listTopLevel] 登录用户 = " + effectiveUserUuid +
                " | 返回 " + result.getTotalElements() + " 条");
        return result;
    }

    /* ② 某条评论的回复列表  ------------------------------------------- */
    @GetMapping("/comments/{commentUuid}/replies")
    public Page<CommentDto> listReplies(
            @PathVariable UUID commentUuid,
            @AuthenticationPrincipal UserDetails principal,                 // ← 同理
            @RequestParam(name = "userUuid", required = false) UUID userUuid,
            Pageable pageable) {

        UUID effectiveUserUuid = principal != null
                ? UUID.fromString(principal.getUsername())
                : userUuid;

        Page<CommentDto> result = commentService.listReplies(
                commentUuid, pageable, effectiveUserUuid);

        System.out.println("[🧩 listReplies] 登录用户 = " + effectiveUserUuid +
                " | 返回 " + result.getTotalElements() + " 条");
        return result;
    }
    /** 新增评论或回复 */
    @PostMapping("/posts/{postUuid}/comments")
    public ResponseEntity<CommentDto> add(
            @PathVariable UUID postUuid,
            @RequestBody @Valid AddCommentReq req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID author = principal != null
                ? UUID.fromString(principal.getUsername())
                : req.getAuthorUuid();

        CommentDto dto = commentService.add(
                postUuid,
                author,
                req.getContent(),
                req.getParentCommentUuid(),
                req.getReplyToUserUuid()
        );
        System.out.println("[🧩 Controller.add] 新增评论: " + dto);
        return ResponseEntity.ok(dto);
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
        CommentDto dto = commentService.toggleLike(commentUuid, me);
        System.out.println("[🧩 Controller.toggleLike] 点赞/取消: " + dto);
        return ResponseEntity.ok(dto);
    }

    /** 单条评论详情（包含回复） */
    @GetMapping("/comments/{commentUuid}")
    public ResponseEntity<CommentDto> get(
            @PathVariable UUID commentUuid,
            @RequestParam(name="userUuid", required=false) UUID userUuid
    ) {
        CommentDto dto = commentService.get(commentUuid, userUuid);
        System.out.println("[🧩 Controller.get] 单条评论详情: " + dto);
        return ResponseEntity.ok(dto);
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
        System.out.println("[🧩 Controller.delete] 删除成功: commentUuid=" + commentUuid + ", by=" + me);
        return ResponseEntity.noContent().build();
    }
}
