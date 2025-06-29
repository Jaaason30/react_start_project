// src/main/java/com/zusa/backend/controller/PostController.java
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
    public Page<PostSummaryDto> feed(@RequestParam(defaultValue = "USER") FeedType type,
                                     Pageable pageable,
                                     @AuthenticationPrincipal UserDetails principal) {

        UUID me = principal == null ? null : UUID.fromString(principal.getUsername());
        return postService.listFeed(type, me, pageable);
    }

    /* ====================================================== */
    /*                 2) 详情  /posts/{uuid}                 */
    /* ====================================================== */
    @GetMapping("/posts/{uuid}")
    public PostDetailDto detail(@PathVariable UUID uuid,
                                @RequestParam(required = false) UUID userUuid,
                                @AuthenticationPrincipal UserDetails principal) {

        UUID me = null;

        if (principal != null) {
            me = UUID.fromString(principal.getUsername());
        } else if (userUuid != null) {
            me = userUuid;
        }

        System.out.println("[🚩 Enter getDetail] uuid=" + uuid + " me=" + me);
        return postService.getDetail(uuid, me);
    }

    /* ====================================================== */
    /*                 3) 创建  POST /posts                   */
    /* ====================================================== */
    @PostMapping(value = "/posts", consumes = "multipart/form-data")
    public ResponseEntity<UUID> create(@ModelAttribute @Validated CreatePostForm form,
                                       @RequestParam(required = false) UUID authorUuid,
                                       @AuthenticationPrincipal UserDetails principal) {

        UUID author = null;

        if (principal != null) {
            author = UUID.fromString(principal.getUsername());
        } else if (authorUuid != null) {
            author = authorUuid;
        } else {
            throw new RuntimeException("未提供用户身份（请登录或指定 authorUuid）");
        }

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
    public void edit(@PathVariable UUID uuid,
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
    public void delete(@PathVariable UUID uuid,
                       @AuthenticationPrincipal UserDetails principal) {

        UUID me = UUID.fromString(principal.getUsername());
        postService.deletePost(uuid, me);
    }
}
