package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.ReactionDto;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.Post;
import com.zusa.backend.entity.post.Reaction;
import com.zusa.backend.repository.PostRepository;
import com.zusa.backend.repository.ReactionRepository;
import com.zusa.backend.repository.UserRepository;
import com.zusa.backend.service.ReactionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * 点赞 / 收藏 业务实现
 */
@Service
@RequiredArgsConstructor
public class ReactionServiceImpl implements ReactionService {

    private final ReactionRepository reactionRepo;
    private final PostRepository     postRepo;
    private final UserRepository     userRepo;

    @Override
    @Transactional
    public ReactionDto toggleReaction(UUID postUuid,
                                      UUID userUuid,
                                      Reaction.Type type) {

        // 1) 校验实体存在
        Post post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 2) 查询是否已存在同类型 Reaction
        Optional<Reaction> existed = reactionRepo
                .findByPostUuidAndUserUuidAndType(postUuid, userUuid, type);

        boolean added;
        LocalDateTime now = LocalDateTime.now();

        if (existed.isPresent()) {
            // --- 取消点赞 / 收藏 ---
            reactionRepo.delete(existed.get());
            added = false;
            if (type == Reaction.Type.LIKE) {
                post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            } else {
                post.setCollectCount(Math.max(0, post.getCollectCount() - 1));
            }
        } else {
            // --- 新增点赞 / 收藏 ---
            Reaction r = Reaction.builder()
                    .post(post)
                    .user(user)
                    .type(type)
                    .build();
            reactionRepo.save(r);
            reactionRepo.flush();
            added = true;
            if (type == Reaction.Type.LIKE) {
                post.setLikeCount(post.getLikeCount() + 1);
            } else {
                post.setCollectCount(post.getCollectCount() + 1);
            }
        }

        // 返回 DTO
        ReactionDto dto = new ReactionDto();
        dto.setPostUuid(postUuid);
        dto.setUserUuid(userUuid);
        dto.setType(type.name());
        dto.setCreatedAt(added ? now : null);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasReaction(UUID postUuid,
                               UUID userUuid,
                               Reaction.Type type) {

        return reactionRepo
                .findByPostUuidAndUserUuidAndType(postUuid, userUuid, type)
                .isPresent();
    }

    @Override
    public void flush() {
        reactionRepo.flush();
    }
}
