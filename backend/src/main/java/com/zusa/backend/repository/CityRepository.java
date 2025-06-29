// src/main/java/com/zusa/backend/repository/CityRepository.java
package com.zusa.backend.repository;

import com.zusa.backend.entity.user.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findByName(String name);
}
