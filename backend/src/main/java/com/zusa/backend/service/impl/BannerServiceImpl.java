// src/main/java/com/zusa/backend/service/impl/BannerServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.BannerDto;
import com.zusa.backend.repository.BannerRepository;
import com.zusa.backend.service.BannerService;
import com.zusa.backend.service.mapper.BannerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepo;
    private final BannerMapper     mapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "activeBanners", unless = "#result == null || #result.isEmpty()", sync = true)
    public List<BannerDto> listActive() {
        return bannerRepo.findActiveBanners(LocalDateTime.now())
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
