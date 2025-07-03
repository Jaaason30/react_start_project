// src/main/java/com/zusa/backend/repository/PostRepository.java
package com.zusa.backend.repository;

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

    /* ========== 5) 详情（抓 author, images, tags） ========== */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Optional<Post> findDetailByUuid(UUID uuid);

    /* ========== 6) 简单详情查找（抓 author, images, tags） ========== */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
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
}