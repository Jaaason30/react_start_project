// src/main/java/com/zusa/backend/controller/MediaController.java

package com.zusa.backend.controller;

import com.zusa.backend.repository.UserProfilePictureRepository;
import com.zusa.backend.repository.UserPhotoRepository;
import com.zusa.backend.entity.user.UserPhoto;
import com.zusa.backend.service.MediaService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final UserProfilePictureRepository picRepo;
    private final UserPhotoRepository photoRepo;
    private final MediaService mediaService;

    /* ---------- GET /api/media/profile/{uuid} ---------- */
    @GetMapping("/profile/{uuid}")
    public ResponseEntity<byte[]> profile(@PathVariable @NotNull UUID uuid) {
        var pic = picRepo.findByUuid(uuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Profile picture not found"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType(Optional.ofNullable(pic.getMime())
                        .orElse("application/octet-stream")));
        headers.setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic());

        return new ResponseEntity<>(
                Base64.getDecoder().decode(pic.getData()),
                headers,
                HttpStatus.OK
        );
    }

    /* ---------- GET /api/media/photo/{uuid} ---------- */
    @GetMapping("/photo/{uuid}")
    public ResponseEntity<byte[]> photo(@PathVariable @NotNull UUID uuid) {
        UserPhoto photo = photoRepo.findByUuid(uuid)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Photo not found"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType(Optional.ofNullable(photo.getMime())
                        .orElse("application/octet-stream")));
        headers.setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic());

        return new ResponseEntity<>(
                Base64.getDecoder().decode(photo.getData()),
                headers,
                HttpStatus.OK
        );
    }

    /* ---------- POST /api/media/upload ---------- */
    @PostMapping("/upload")
    public ResponseEntity<String> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subDir", required = false) String subDir
    ) {
        try {
            String url = mediaService.uploadImage(file, Optional.ofNullable(subDir).orElse("post"));
            System.out.println("[✅ 上传成功] " + url);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("上传失败: " + e.getMessage());
        }
    }

    /* ---------- POST /api/media/uploads ---------- */
    @PostMapping("/uploads")
    public ResponseEntity<List<String>> uploads(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "subDir", required = false) String subDir
    ) {
        try {
            List<String> urls = mediaService.uploadImages(files, Optional.ofNullable(subDir).orElse("post"));
            System.out.println("[✅ 批量上传成功] " + urls);
            return ResponseEntity.ok(urls);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList("上传失败: " + e.getMessage()));
        }
    }
}
