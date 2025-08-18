package com.zusa.backend.repository;

import com.zusa.backend.entity.post.texttoimage.TextImageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TextImageHistoryRepository extends JpaRepository<TextImageHistory, Long> {

    /**
     * 查询指定文本、用户及风格类型的最新一条历史记录
     */
    Optional<TextImageHistory> findTopByTextAndUserIdAndStyleTypeOrderByCreatedAtDesc(
            String text,
            String userId,
            Integer styleType
    );

    /**
     * 获取指定用户的所有记录，按创建时间倒序
     */
    List<TextImageHistory> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 删除指定用户的所有历史记录
     */
    void deleteByUserId(String userId);
}
