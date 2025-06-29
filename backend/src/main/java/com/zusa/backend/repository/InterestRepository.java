// src/main/java/com/zusa/backend/repository/InterestRepository.java
package com.zusa.backend.repository;
import com.zusa.backend.entity.user.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
public interface InterestRepository extends JpaRepository<Interest, Long> {}