// src/main/java/com/zusa/backend/repository/VenueRepository.java
package com.zusa.backend.repository;
import com.zusa.backend.entity.user.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VenueRepository extends JpaRepository<Venue, Long> {}