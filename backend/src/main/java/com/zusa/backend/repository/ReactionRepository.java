package com.zusa.backend.repository;

import com.zusa.backend.entity.post.Reaction;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReactionRepository
        extends JpaRepository<Reaction, Long>,
        JpaSpecificationExecutor<Reaction> {

    /* 已有 —— 单类型 */
    @Query("""
        select r
        from Reaction r
        where r.post.uuid = :postUuid
          and r.user.uuid = :userUuid
          and r.type      = :type
    """)
    Optional<Reaction> findByPostUuidAndUserUuidAndType(@Param("postUuid") UUID postUuid,
                                                        @Param("userUuid") UUID userUuid,
                                                        @Param("type")     Reaction.Type type);

    /* 已有 —— 计数 */
    @Query("""
        select count(r)
        from Reaction r
        where r.post.uuid = :postUuid
          and r.type      = :type
    """)
    long countByPostUuidAndType(@Param("postUuid") UUID postUuid,
                                @Param("type")     Reaction.Type type);

    /* ★ 新增 —— 一次性取当前用户在该帖子上的所有 Reaction 类型 */
    @Query("""
        select r.type
        from Reaction r
        where r.post.uuid = :postUuid
          and r.user.uuid = :userUuid
    """)
    List<Reaction.Type> findTypesByPostAndUser(@Param("postUuid") UUID postUuid,
                                               @Param("userUuid") UUID userUuid);
}
