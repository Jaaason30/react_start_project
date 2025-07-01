// src/main/java/com/zusa/backend/service/impl/CommentServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.entity.post.Comment;
import com.zusa.backend.entity.post.CommentLike;
import com.zusa.backend.entity.User;
import com.zusa.backend.repository.CommentLikeRepository;
import com.zusa.backend.repository.CommentRepository;
import com.zusa.backend.repository.PostRepository;
import com.zusa.backend.repository.UserRepository;
import com.zusa.backend.service.CommentService;
import com.zusa.backend.service.mapper.CommentMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepo;
    private final CommentLikeRepository likeRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final CommentMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> list(UUID postUuid, SortType sortType, Pageable pageable, UUID userUuid) {
        Sort s = switch (sortType) {
            case HOT -> Sort.by(Sort.Order.desc("likeCount"), Sort.Order.desc("createdAt"));
            case LATEST -> Sort.by(Sort.Order.desc("createdAt"));
        };
        Pageable pr = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        Page<CommentDto> page = commentRepo.findByPost_Uuid(postUuid, pr)
                .map(mapper::toDto);

        if (userUuid != null && !page.isEmpty()) {
            List<UUID> ids = page.stream()
                    .map(CommentDto::getUuid)
                    .collect(Collectors.toList());
            Set<UUID> likedSet = likeRepo
                    .findAllByUser_UuidAndComment_UuidIn(userUuid, ids)
                    .stream()
                    .map(cl -> cl.getComment().getUuid())
                    .collect(Collectors.toSet());
            page.forEach(dto -> dto.setLikedByCurrentUser(likedSet.contains(dto.getUuid())));
        }
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public CommentDto get(UUID commentUuid, UUID userUuid) {
        Comment c = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        CommentDto dto = mapper.toDto(c);
        if (userUuid != null) {
            boolean liked = likeRepo.findByComment_UuidAndUser_Uuid(commentUuid, userUuid)
                    .isPresent();
            dto.setLikedByCurrentUser(liked);
        }
        return dto;
    }

    @Override
    @Transactional
    public CommentDto add(UUID postUuid, UUID authorUuid, String content) {
        if (content == null || content.isBlank() || content.length() > 500)
            throw new IllegalArgumentException("评论内容不能为空且不超过 500 字");

        var post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        var author = userRepo.findByUuid(authorUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Comment c = Comment.builder()
                .post(post)
                .author(author)
                .content(content.trim())
                .build();
        commentRepo.save(c);

        post.setCommentCount(post.getCommentCount() + 1);
        return mapper.toDto(c);
    }

    @Override
    @Transactional
    public CommentDto toggleLike(UUID commentUuid, UUID userUuid) {
        Comment c = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        User u = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<CommentLike> exist = likeRepo.findByComment_UuidAndUser_Uuid(commentUuid, userUuid);
        if (exist.isPresent()) {
            likeRepo.delete(exist.get());
            c.setLikeCount(Math.max(0, c.getLikeCount() - 1));
        } else {
            likeRepo.save(CommentLike.builder().comment(c).user(u).build());
            c.setLikeCount(c.getLikeCount() + 1);
        }
        CommentDto dto = mapper.toDto(c);
        dto.setLikedByCurrentUser(!exist.isPresent());
        return dto;
    }

    @Override
    @Transactional
    public void delete(UUID commentUuid, UUID authorUuid) {
        Comment c = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        if (!c.getAuthor().getUuid().equals(authorUuid)) {
            throw new SecurityException("只能删除自己的评论");
        }
        var post = c.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        commentRepo.delete(c);
    }
}
