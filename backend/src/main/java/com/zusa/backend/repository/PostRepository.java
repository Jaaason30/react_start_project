package com.zusa.backend.repository;

import com.zusa.backend.entity.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.QueryHints;
import org.hibernate.jpa.HibernateHints;
import jakarta.persistence.QueryHint;


import jakarta.persistence.QueryHint;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository
        extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    /* ---------- USER / 默认瀑布流 ---------- */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /* ---------- OFFICIAL Feed（新增）---------- */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))

    Page<Post> findByAuthor_EmailInOrderByCreatedAtDesc(Collection<String> emails, Pageable pageable);

    /* ---------- 作者个人页 ---------- */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))

    Page<Post> findByAuthor_UuidOrderByCreatedAtDesc(UUID authorUuid, Pageable pageable);

    /* ---------- 标签 ---------- */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))

    Page<Post> findByTags_NameOrderByCreatedAtDesc(String tagName, Pageable pageable);

    /* ---------- 详情 ---------- */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))

    Optional<Post> findDetailByUuid(UUID uuid);

    /* ========== 详情专用 ========== */
    @EntityGraph(attributePaths = {"author", "images", "tags"})
    @QueryHints(@QueryHint(name = "jakarta.persistence.passDistinctThrough", value = "false"))

    /* ！！！Service 的 edit / delete 里仍在用这个简单方法 —— 保留即可 */
    Optional<Post> findByUuid(UUID uuid);
}
