// src/main/java/com/zusa/backend/repository/TagRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.post.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    /* ---------- 自动补全（前缀 / 任意匹配皆可） ---------- */
    List<Tag> findByNameContainingIgnoreCaseOrderByNameAsc(String keyword, Pageable pageable);

    /* ---------- 统计热门标签（按帖子的数量倒序） ---------- */
    @Query("""
        select t
        from Post p join p.tags t
        group by t
        order by count(p) desc
    """)
    List<Tag> findHotTags(Pageable pageable);
}
