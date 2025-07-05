// src/main/java/com/zusa/backend/repository/VenueRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.user.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    // ✅ 新增支持根据名称批量查询
    List<Venue> findAllByNameIn(List<String> names);
}