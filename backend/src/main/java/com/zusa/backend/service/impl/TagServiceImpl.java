// src/main/java/com/zusa/backend/service/impl/TagServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.TagDto;
import com.zusa.backend.entity.post.Tag;
import com.zusa.backend.repository.TagRepository;
import com.zusa.backend.service.TagService;
import com.zusa.backend.service.mapper.TagMapper;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepo;
    private final TagMapper     mapper;

    /* ---------------- 自动补全 ---------------- */
    @Override
    @Transactional(readOnly = true)
    public List<TagDto> suggest(String keyword, int limit) {
        if (keyword == null || keyword.isBlank()) return List.of();

        return tagRepo
                .findByNameContainingIgnoreCaseOrderByNameAsc(
                        keyword.trim(), PageRequest.of(0, limit))
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    /* ---------------- 热门标签 ---------------- */
    @Override
    @Transactional(readOnly = true)
    public List<TagDto> hot(int limit) {
        return tagRepo.findHotTags(PageRequest.of(0, limit))
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    /* ---------------- 创建（若不存在） ---------------- */
    @Override
    @Transactional
    public TagDto createIfAbsent(String rawName) {
        String name = normalize(rawName);
        if (name.isBlank()) {
            throw new IllegalArgumentException("标签不能为空");
        }

        Tag tag = tagRepo.findByName(name).orElseGet(() -> {
            try {
                return tagRepo.save(Tag.builder().name(name).build());
            } catch (DataIntegrityViolationException e) {   // 并发下可能冲突
                return tagRepo.findByName(name)
                        .orElseThrow(() -> new EntityExistsException("Tag already exists"));
            }
        });

        return mapper.toDto(tag);
    }

    /* ---------- 工具 ---------- */
    private String normalize(String raw) {
        return Optional.ofNullable(raw)
                .orElse("")
                .trim()
                .replace("#", "")
                .toLowerCase(Locale.ROOT);
    }
}
