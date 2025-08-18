// src/main/java/com/zusa/backend/repository/PostRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.MediaType;
import com.zusa.backend.entity.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.QueryHint;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository
        extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    /* ========== 1) 默认/用户瀑布流（只抓 author） ========== */
    @EntityGraph(attributePaths = {"author"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /* ========== 2) 官方 Feed（只抓 author） ========== */
    @EntityGraph(attributePaths = {"author"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByAuthor_EmailInOrderByCreatedAtDesc(Collection<String> emails, Pageable pageable);

    /* ========== 3) 作者个人页（只抓 author） ========== */
    @EntityGraph(attributePaths = {"author"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByAuthor_UuidOrderByCreatedAtDesc(UUID authorUuid, Pageable pageable);

    /* ========== 4) 按标签查询（只抓 author） ========== */
    @EntityGraph(attributePaths = {"author"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByTags_NameOrderByCreatedAtDesc(String tagName, Pageable pageable);

    /* ========== 5) 详情（抓 author, images, tags, video） ========== */
    @EntityGraph(attributePaths = {"author", "images", "tags", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Optional<Post> findDetailByUuid(UUID uuid);

    /* ========== 6) 简单详情查找（抓 author, images, tags, video） ========== */
    @EntityGraph(attributePaths = {"author", "images", "tags", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Optional<Post> findByUuid(UUID uuid);

    /* ========== 7) 全文搜索（标题 / 内容 / 作者昵称 / 作者shortId / 标签） ========== */
    @EntityGraph(attributePaths = {"author"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    @Query("""
        select distinct p
          from Post p
          left join p.tags t
         where lower(p.title) like lower(concat('%', :kw, '%'))
            or p.content like concat('%', :kw, '%')
            or lower(p.author.nickname) like lower(concat('%', :kw, '%'))
            or cast(p.author.shortId as string) like concat('%', :kw, '%')
            or lower(t.name) like lower(concat('%', :kw, '%'))
         order by p.createdAt desc
    """)
    Page<Post> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    // [VIDEO-QUERY] 开始 - 按媒体类型查询
    /* ========== 8) 按媒体类型查询用户Feed ========== */
    @EntityGraph(attributePaths = {"author", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByMediaTypeOrderByCreatedAtDesc(MediaType mediaType, Pageable pageable);

    /* ========== 9) 按媒体类型查询官方Feed ========== */
    @EntityGraph(attributePaths = {"author", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByMediaTypeAndAuthor_EmailInOrderByCreatedAtDesc(
            MediaType mediaType, Collection<String> emails, Pageable pageable);

    /* ========== 10) 按媒体类型查询作者个人页 ========== */
    @EntityGraph(attributePaths = {"author", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByMediaTypeAndAuthor_UuidOrderByCreatedAtDesc(
            MediaType mediaType, UUID authorUuid, Pageable pageable);

    /* ========== 11) 按媒体类型和标签查询 ========== */
    @EntityGraph(attributePaths = {"author", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findByMediaTypeAndTags_NameOrderByCreatedAtDesc(
            MediaType mediaType, String tagName, Pageable pageable);

    /* ========== 12) 全文搜索 + 媒体类型过滤 ========== */
    @EntityGraph(attributePaths = {"author", "video"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    @Query("""
        select distinct p
          from Post p
          left join p.tags t
         where p.mediaType = :mediaType
           and (lower(p.title) like lower(concat('%', :kw, '%'))
            or p.content like concat('%', :kw, '%')
            or lower(p.author.nickname) like lower(concat('%', :kw, '%'))
            or cast(p.author.shortId as string) like concat('%', :kw, '%')
            or lower(t.name) like lower(concat('%', :kw, '%')))
         order by p.createdAt desc
    """)
    Page<Post> searchByKeywordAndMediaType(
            @Param("kw") String keyword, @Param("mediaType") MediaType mediaType, Pageable pageable);
    // [VIDEO-QUERY] 结束
<<<<<<< HEAD
=======
    
    /* ========== 13) 查询帖子ID和作者验证 ========== */
    @Query("SELECT p.id FROM Post p WHERE p.uuid = :uuid AND p.author.uuid = :authorUuid")
    Optional<Long> findPostIdAndAuthorByUuid(@Param("uuid") UUID uuid, @Param("authorUuid") UUID authorUuid);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Post p WHERE p.uuid = :uuid")
    boolean existsByUuid(@Param("uuid") UUID uuid);
    
    /* ========== 14) 原生SQL执行（用于删除操作） ========== */
    // 先删除 media_file_videos 表中的相关记录（如果存在）
    @Modifying
    @Query(value = "DELETE mfv FROM media_file_videos mfv INNER JOIN media_files mf ON mfv.media_file_id = mf.id WHERE mf.post_id = ?1", nativeQuery = true)
    void deleteMediaFileVideosByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM media_files WHERE post_id = ?1", nativeQuery = true)
    void deleteMediaFilesByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM post_videos WHERE post_id = ?1", nativeQuery = true)
    void deletePostVideosByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM post_images WHERE post_id = ?1", nativeQuery = true)
    void deletePostImagesByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM post_reactions WHERE post_id = ?1", nativeQuery = true)
    void deletePostReactionsByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM post_comments WHERE post_id = ?1", nativeQuery = true)
    void deletePostCommentsByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM post_tags WHERE post_id = ?1", nativeQuery = true)
    void deletePostTagsByPostId(Long postId);
    
    @Modifying
    @Query(value = "DELETE FROM posts WHERE id = ?1", nativeQuery = true)
    void deletePostByIdNative(Long postId);
>>>>>>> c99daa6 (Initial commit - Clean project state)
}