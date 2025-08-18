// src/main/java/com/zusa/backend/repository/GenderRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.user.Gender;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GenderRepository extends JpaRepository<Gender, Long> {
    Optional<Gender> findByText(String text);

    // ✅ 新增支持批量查询（用于多选性别偏好）
    List<Gender> findAllByIdIn(List<Long> ids);

    // ✅ 新增支持根据名称批量查询
    List<Gender> findAllByTextIn(List<String> texts);
}
