// src/main/java/com/zusa/backend/repository/UserDatesRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.user.UserDates;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDatesRepository extends JpaRepository<UserDates, Long> {
    // 如无自定义查询，可留空
}
