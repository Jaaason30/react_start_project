package com.zusa.backend.controller;

import com.zusa.backend.dto.post.BannerDto;
import com.zusa.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    /* ---------- 首页横幅（正在生效） ---------- */
    @GetMapping("/active")
    public List<BannerDto> active() {
        return bannerService.listActive();
    }
}
