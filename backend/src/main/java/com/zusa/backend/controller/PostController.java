package com.zusa.backend.controller;

import com.zusa.backend.dto.post.PostDetailDto;
import com.zusa.backend.dto.post.PostSummaryDto;
import com.zusa.backend.service.PostService;
import com.zusa.backend.service.model.CreatePostCmd;
import com.zusa.backend.service.model.EditPostCmd;
import com.zusa.backend.service.model.FeedType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class PostController {

    private final PostService postService;

    /* ====================================================== */
    /*                 1) Feed 列表 /posts/feed               */
    /* ====================================================== */
    @GetMapping("/posts/feed")
    public Page<PostSummaryDto> feed(
            @RequestParam(defaultValue = "USER") FeedType type,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails principal) {

        UUID me = (principal != null)
                ? UUID.fromString(principal.getUsername())
                : null;

        return postService.listFeed(type, me, pageable);
    }

    /* ====================================================== */
    /*                 2) 详情  /posts/{uuid}                 */
    /* ====================================================== */
    @GetMapping("/posts/{uuid}")
    public PostDetailDto detail(
            @PathVariable UUID uuid,
            @AuthenticationPrincipal UserDetails principal) {

        UUID me = (principal != null)
                ? UUID.fromString(principal.getUsername())
                : null;

        return postService.getDetail(uuid, me);
    }

    /* ====================================================== */
    /*                 3) 创建  POST /posts                   */
    /* ====================================================== */
    @PostMapping(value = "/posts", consumes = "multipart/form-data")
    public ResponseEntity<UUID> create(
            @ModelAttribute @Validated CreatePostForm form,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            throw new RuntimeException("请登录");
        }

        UUID author = UUID.fromString(principal.getUsername());
        UUID postId = postService.createPost(form.toCmd(), author);
        return ResponseEntity.ok(postId);
    }

    @Value
    public static class CreatePostForm {
        @NotBlank String title;
        @NotBlank String content;

        @Size(min = 1, max = 9)
        List<MultipartFile> images;

        Set<String> tagNames;

        public CreatePostCmd toCmd() {
            return new CreatePostCmd(title, content, images, tagNames);
        }
    }

    /* ====================================================== */
    /*                 4) 编辑  PATCH /posts/{uuid}           */
    /* ====================================================== */
    @PatchMapping("/posts/{uuid}")
    public void edit(
            @PathVariable UUID uuid,
            @RequestBody @Validated EditPostReq req,
            @AuthenticationPrincipal UserDetails principal) {

        UUID me = UUID.fromString(principal.getUsername());
        postService.editPost(new EditPostCmd(
                uuid,
                req.title,
                req.content,
                req.tagNames
        ), me);
    }

    @Value
    public static class EditPostReq {
        String title;
        String content;
        Set<String> tagNames;
    }

    /* ====================================================== */
    /*                 5) 删除  DELETE /posts/{uuid}          */
    /* ====================================================== */
    @DeleteMapping("/posts/{uuid}")
    public void delete(
            @PathVariable UUID uuid,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            throw new RuntimeException("请登录");
        }

        UUID me = UUID.fromString(principal.getUsername());
        postService.deletePost(uuid, me);
    }

    /* ====================================================== */
    /*                 6) 全文搜索 /posts/search              */
    /* ====================================================== */
    @GetMapping("/posts/search")
    public Page<PostSummaryDto> search(
            @RequestParam("kw") @NotBlank String keyword,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails principal) {

        UUID me = (principal != null)
                ? UUID.fromString(principal.getUsername())
                : null;

        return postService.search(keyword, me, pageable);
    }

    /* ====================================================== */
    /*            7) 获取当前用户的帖子 /posts/me             */
    /* ====================================================== */
    @GetMapping("/posts/me")
    public Page<PostSummaryDto> getMyPosts(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            throw new RuntimeException("请登录");
        }

        UUID authorUuid = UUID.fromString(principal.getUsername());
        return postService.listByAuthor(authorUuid, authorUuid, pageable);
    }

    /* ====================================================== */
    /*     8) 按作者UUID查询 /posts/user/{authorUuid}         */
    /*        (保留以向后兼容)                                */
    /* ====================================================== */
    @GetMapping("/posts/user/{authorUuid}")
    public Page<PostSummaryDto> listByAuthor(
            @PathVariable UUID authorUuid,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails principal) {

        UUID me = (principal != null)
                ? UUID.fromString(principal.getUsername())
                : null;

        return postService.listByAuthor(authorUuid, me, pageable);
    }

    /* ====================================================== */
    /*   9) 按作者shortId查询 /posts/user/short/{shortId}     */
    /* ====================================================== */
    @GetMapping("/posts/user/short/{shortId}")
    public Page<PostSummaryDto> listByAuthorShortId(
            @PathVariable Long shortId,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails principal) {

        UUID me = (principal != null)
                ? UUID.fromString(principal.getUsername())
                : null;

        return postService.listByAuthorShortId(shortId, me, pageable);
    }
}