package com.zusa.backend.controller;

import com.zusa.backend.dto.post.TagDto;
import com.zusa.backend.service.TagService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Validated
public class TagController {

    private final TagService tagService;

    /* ------------ 热门标签 -------------- */
    @GetMapping("/hot")
    public List<TagDto> hot(@RequestParam(defaultValue = "20") @Positive int limit) {
        return tagService.hot(limit);
    }

    /* ------------ 关键词自动补全 --------- */
    @GetMapping("/suggest")
    public List<TagDto> suggest(@RequestParam("kw") @NotBlank String kw,
                                @RequestParam(defaultValue = "20") @Positive int limit) {
        return tagService.suggest(kw, limit);
    }
}
