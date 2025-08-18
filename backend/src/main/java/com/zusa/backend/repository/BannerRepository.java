// src/main/java/com/zusa/backend/repository/BannerRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.post.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    /**
     * 查询当前“生效”中的横幅，并按 sortOrder 排序
     * startAt/endAt 可为 null，分别表示不设上线/下线
     */
    @Query("""
      select b 
      from Banner b 
      where b.enabled = true
        and (b.startAt is null or b.startAt <= :now)
        and (b.endAt   is null or b.endAt   >= :now)
      order by b.sortOrder asc
      """)
    List<Banner> findActiveBanners(@Param("now") LocalDateTime now);
}
