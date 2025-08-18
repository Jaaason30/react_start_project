package com.zusa.backend.repository;

import com.zusa.backend.entity.post.PostVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * 视频元数据Repository
 */
public interface PostVideoRepository extends JpaRepository<PostVideo, Long> {
    
    /**
     * 根据UUID查找视频元数据
     */
    Optional<PostVideo> findByUuid(UUID uuid);
    
    /**
     * 根据帖子ID查找视频元数据
     */
    @Query("SELECT pv FROM PostVideo pv WHERE pv.post.id = :postId")
    Optional<PostVideo> findByPostId(@Param("postId") Long postId);
    
    /**
     * 根据帖子UUID查找视频元数据
     */
    @Query("SELECT pv FROM PostVideo pv WHERE pv.post.uuid = :postUuid")
    Optional<PostVideo> findByPostUuid(@Param("postUuid") UUID postUuid);
}