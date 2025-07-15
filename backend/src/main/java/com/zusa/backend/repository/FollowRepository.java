package com.zusa.backend.repository;

import com.zusa.backend.entity.user.Follow;
import com.zusa.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 仓库接口：管理关注关系 Follow 实体
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    /**
     * 判断是否已关注
     */
    boolean existsByFollowerAndTarget(User follower, User target);

    /**
     * 取消关注
     */
    void deleteByFollowerAndTarget(User follower, User target);

    /**
     * 分页查询某人粉丝（被关注者为 target）
     */
    Page<Follow> findByTarget(User target, Pageable pageable);

    /**
     * 分页查询某人关注列表（关注者为 follower）
     */
    Page<Follow> findByFollower(User follower, Pageable pageable);
}
