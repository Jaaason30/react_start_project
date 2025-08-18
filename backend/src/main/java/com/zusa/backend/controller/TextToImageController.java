package com.zusa.backend.controller;

import com.zusa.backend.service.ImageGenerationService;
import com.zusa.backend.dto.post.texttoimage.TextRequest;
import com.zusa.backend.dto.post.texttoimage.ImageResponse;
import com.zusa.backend.dto.post.texttoimage.HistoryResponse;

import jakarta.validation.Valid;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/text-images")
@RequiredArgsConstructor
@Tag(name = "文字转图片", description = "文字转图片相关接口")
public class TextToImageController {

    private final ImageGenerationService imageService;
    private static final Logger log = LoggerFactory.getLogger(TextToImageController.class);

    @PostMapping("/generate")
    @Operation(summary = "生成文字图片", description = "将文字转换为图片")
    public ResponseEntity<ImageResponse> generateImage(
            @Valid @RequestBody TextRequest request,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] POST /api/text-images/generate — UUID = {}, text length = {}, styleType = {}",
                currentUuid, request.getText().length(), request.getStyleType());

        // 读取 styleType，默认 1（渐变风格）
        int styleType = (request.getStyleType() != null) ? request.getStyleType() : 1;

        String imageUrl = imageService.generateImage(
                request.getText(),
                currentUuid.toString(),
                styleType
        );

        return ResponseEntity.ok(new ImageResponse(imageUrl));
    }

    @GetMapping("/history")
    @Operation(summary = "获取生成历史", description = "获取用户的文字转图片历史记录")
    public ResponseEntity<List<HistoryResponse>> getHistory(
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] GET /api/text-images/history — UUID = {}", currentUuid);

        List<HistoryResponse> history = imageService.getUserHistory(currentUuid.toString());

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    @Operation(summary = "删除历史记录", description = "删除指定的历史记录")
    public ResponseEntity<Void> deleteHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID currentUuid = UUID.fromString(principal.getUsername());
        log.info("[Controller] DELETE /api/text-images/history/{} — UUID = {}", id, currentUuid);

        imageService.deleteHistory(id, currentUuid.toString());

        return ResponseEntity.ok().build();
    }
}
