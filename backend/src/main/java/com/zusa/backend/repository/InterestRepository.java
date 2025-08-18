// src/main/java/com/zusa/backend/repository/InterestRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.user.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterestRepository extends JpaRepository<Interest, Long> {
    // ✅ 新增支持根据名称批量查询
    List<Interest> findAllByNameIn(List<String> names);
}