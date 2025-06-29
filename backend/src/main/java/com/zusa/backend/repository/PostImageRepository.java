// src/main/java/com/zusa/backend/repository/PostImageRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.post.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    /** 按帖子 UUID 获取所有图片，按 idx 排序 */
    List<PostImage> findByPost_UuidOrderByIdxAsc(UUID postUuid);
}
