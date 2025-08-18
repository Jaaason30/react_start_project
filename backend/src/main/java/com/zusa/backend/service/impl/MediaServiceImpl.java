// src/main/java/com/zusa/backend/service/impl/MediaServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.VideoMetadataDto;
import com.zusa.backend.entity.post.PostVideo;
import com.zusa.backend.repository.PostVideoRepository;
import com.zusa.backend.service.MediaService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaServiceImpl implements MediaService {

    /* --------------- 注入配置 --------------- */
    @Value("${app.upload.base-path}") private Path   basePath;   // 例如 /opt/zusa/uploads
    @Value("${app.upload.base-url}")  private String baseUrl;    // 例如 /static/uploads
    @Value("${app.upload.max-size-bytes}") private long  maxSize;
    @Value("${app.upload.allowed-types}")  private List<String> allowed;
    
    private final PostVideoRepository postVideoRepository;

    /* --------------- 对外方法 --------------- */
    @Override
    @Transactional
    public String uploadImage(MultipartFile file, String subDir) {
        validate(file);
        String filename = store(file, subDir);
        return publicUrl(subDir, filename);
    }

    @Override
    @Transactional
    public List<String> uploadImages(List<MultipartFile> files, String subDir) {
        List<String> urls = new ArrayList<>(files.size());
        for (MultipartFile f : files) {
            urls.add(uploadImage(f, subDir));
        }
        return urls;
    }

    /* --------------- 私有工具 --------------- */

    /** 校验大小 & MIME */
    private void validate(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("文件为空");
        if (file.getSize() > maxSize)
            throw new IllegalArgumentException("文件大小不能超过 "
                    + DataSize.ofBytes(maxSize).toKilobytes() + " KB");

        String mime = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase(Locale.ROOT);
        if (allowed.stream().map(String::toLowerCase).noneMatch(mime::contains)) {
            throw new IllegalArgumentException("不支持的文件类型: " + mime);
        }
    }

    /** 真正把文件写到磁盘 */
    private String store(MultipartFile file, String subDir) {
        try {
            // 确保目录存在
            Path dir = basePath.resolve(Optional.ofNullable(subDir).orElse("misc"));
            Files.createDirectories(dir);

            // 随机文件名 – 保留后缀
            String ext = FilenameUtils.getExtension(Optional
                    .ofNullable(file.getOriginalFilename())
                    .orElse("bin"));
            String filename = UUID.randomUUID() + "." + ext;

            // 写入
            Path dst = dir.resolve(filename);
            Files.copy(file.getInputStream(), dst, StandardCopyOption.REPLACE_EXISTING);

            return filename;
        } catch (IOException e) {
            throw new RuntimeException("保存文件失败", e);
        }
    }

    /** 生成对外 URL */
    private String publicUrl(String subDir, String filename) {
        String dir = Optional.ofNullable(subDir).orElse("misc");
        return baseUrl + "/" + dir + "/" + filename;       // 例：/static/uploads/post/xxx.webp
    }

    // [VIDEO-METHODS] 开始
    @Override
    @Transactional
    public String uploadVideo(MultipartFile file, String subDir) {
        validateVideo(file);
        return storeVideo(file, subDir);
    }

    @Override
    public VideoMetadataDto extractVideoMetadata(String videoPath) {
        try {
            Path fullPath = basePath.resolve(videoPath);
            if (!Files.exists(fullPath)) {
                throw new IllegalArgumentException("视频文件不存在: " + videoPath);
            }

            // 简化实现：获取基本文件信息
            // 生产环境建议使用 FFmpeg 或 JavaCV 提取详细元数据
            VideoMetadataDto metadata = new VideoMetadataDto();
            metadata.setSizeBytes(Files.size(fullPath));
            
            // 默认值，实际应从视频文件解析
            metadata.setDurationSeconds(30); // 默认30秒
            metadata.setWidth(1920);         // 默认1080p
            metadata.setHeight(1080);
            
            String ext = FilenameUtils.getExtension(videoPath).toLowerCase();
            metadata.setMimeType("video/" + ext);
            
            return metadata;
        } catch (IOException e) {
            throw new RuntimeException("读取视频元数据失败", e);
        }
    }

    @Override
    public void streamMedia(UUID mediaUuid, HttpServletResponse response) {
        try {
            PostVideo postVideo = postVideoRepository.findByUuid(mediaUuid)
                .orElseThrow(() -> new IllegalArgumentException("媒体文件不存在"));

            Path filePath = basePath.resolve(postVideo.getVideoPath());
            if (!Files.exists(filePath)) {
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return;
            }

            long fileSize = Files.size(filePath);
            String contentType = postVideo.getMimeType();

            // 设置响应头
            response.setContentType(contentType);
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Content-Length", String.valueOf(fileSize));

            // 简化实现：直接返回完整文件
            // 生产环境应支持 Range 请求用于视频流播放
            try (InputStream inputStream = Files.newInputStream(filePath);
                 OutputStream outputStream = response.getOutputStream()) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }
        } catch (Exception e) {
            log.error("流媒体传输失败: {}", e.getMessage(), e);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public String getVideoUrl(PostVideo postVideo) {
        return "/api/media/" + postVideo.getUuid().toString();
    }

    @Override
    public String getVideoCoverUrl(PostVideo postVideo) {
        return publicUrl("video", Paths.get(postVideo.getCoverPath()).getFileName().toString());
    }

    /**
     * 从视频文件生成封面图
     */
    @Override
    public String generateVideoCover(String videoPath, String subDir) {
        try {
            Path fullVideoPath = basePath.resolve(videoPath);
            if (!Files.exists(fullVideoPath)) {
                log.warn("视频文件不存在，使用默认封面: {}", videoPath);
                return generateDefaultVideoCover(subDir);
            }

            // 生成封面文件名
            String coverFilename = UUID.randomUUID() + ".jpg";
            Path coverDir = basePath.resolve(Optional.ofNullable(subDir).orElse("video"));
            Files.createDirectories(coverDir);
            Path coverPath = coverDir.resolve(coverFilename);

            // 尝试使用FFmpeg提取视频第一帧
            boolean success = extractVideoFrameWithFFmpeg(fullVideoPath, coverPath);
            
            if (!success) {
                log.warn("FFmpeg提取视频帧失败，使用默认封面");
                return generateDefaultVideoCover(subDir);
            }

            log.info("成功生成视频封面: {}", coverPath);
            return subDir + "/" + coverFilename;
            
        } catch (Exception e) {
            log.error("生成视频封面失败: {}", e.getMessage(), e);
            return generateDefaultVideoCover(subDir);
        }
    }

    /**
     * 使用FFmpeg提取视频第一帧
     */
    private boolean extractVideoFrameWithFFmpeg(Path videoPath, Path outputPath) {
        try {
            // FFmpeg命令：提取视频第1秒的帧作为封面
            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath.toString(),
                "-ss", "00:00:01",          // 从第1秒开始
                "-vframes", "1",            // 只提取1帧
                "-y",                       // 覆盖现有文件
                "-q:v", "2",               // 高质量
                "-vf", "scale=400:600:force_original_aspect_ratio=decrease,pad=400:600:(ow-iw)/2:(oh-ih)/2", // 缩放到400x600并保持比例
                outputPath.toString()
            );
            
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // 读取输出日志
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("FFmpeg: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0 && Files.exists(outputPath) && Files.size(outputPath) > 1000) {
                log.info("FFmpeg成功提取视频封面，文件大小: {} bytes", Files.size(outputPath));
                return true;
            } else {
                log.warn("FFmpeg提取失败，退出码: {}, 文件存在: {}", exitCode, Files.exists(outputPath));
                return false;
            }
            
        } catch (Exception e) {
            log.error("FFmpeg执行失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 生成默认的视频封面
     */
    private String generateDefaultVideoCover(String subDir) {
        try {
            Path coverDir = basePath.resolve(Optional.ofNullable(subDir).orElse("video"));
            Files.createDirectories(coverDir);
            
            String coverFilename = "default_video_cover_" + UUID.randomUUID() + ".png";
            Path coverPath = coverDir.resolve(coverFilename);
            
            // 创建一个简单的默认封面图片
            createDefaultCoverImage(coverPath);
            
            return subDir + "/" + coverFilename;
        } catch (Exception e) {
            log.error("生成默认视频封面失败: {}", e.getMessage(), e);
            throw new RuntimeException("无法生成视频封面", e);
        }
    }

    /**
     * 创建默认封面图片
     */
    private void createDefaultCoverImage(Path outputPath) throws IOException {
        // 创建一个400x600的PNG图片，深灰色背景，中间有播放按钮图标
        try {
            java.awt.image.BufferedImage image = new java.awt.image.BufferedImage(400, 600, java.awt.image.BufferedImage.TYPE_INT_RGB);
            java.awt.Graphics2D g2d = image.createGraphics();
            
            // 设置背景色为深灰色
            g2d.setColor(new java.awt.Color(64, 64, 64));
            g2d.fillRect(0, 0, 400, 600);
            
            // 绘制播放按钮
            g2d.setColor(java.awt.Color.WHITE);
            g2d.setStroke(new java.awt.BasicStroke(3));
            
            // 播放按钮三角形
            int centerX = 200, centerY = 300;
            int size = 50;
            int[] xPoints = {centerX - size/2, centerX + size/2, centerX - size/2};
            int[] yPoints = {centerY - size/2, centerY, centerY + size/2};
            g2d.fillPolygon(xPoints, yPoints, 3);
            
            // 圆形边框
            g2d.drawOval(centerX - size, centerY - size, size * 2, size * 2);
            
            g2d.dispose();
            
            // 保存为PNG
            javax.imageio.ImageIO.write(image, "PNG", outputPath.toFile());
            
        } catch (Exception e) {
            log.error("创建默认封面图片失败: {}", e.getMessage(), e);
            // 如果Java图形操作失败，创建一个简单的文本文件作为占位符
            Files.write(outputPath, "DEFAULT_VIDEO_COVER".getBytes());
        }
    }

    /** 校验视频文件 */
    private void validateVideo(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("视频文件为空");
        
        long videoMaxSize = 104857600L; // 100MB
        if (file.getSize() > videoMaxSize) {
            throw new IllegalArgumentException("视频文件不能超过100MB");
        }

        String mime = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
        if (!mime.startsWith("video/")) {
            throw new IllegalArgumentException("不支持的视频类型: " + mime);
        }
    }

    /** 存储视频文件 */
    private String storeVideo(MultipartFile file, String subDir) {
        try {
            Path dir = basePath.resolve(Optional.ofNullable(subDir).orElse("video"));
            Files.createDirectories(dir);

            String ext = FilenameUtils.getExtension(Optional
                    .ofNullable(file.getOriginalFilename())
                    .orElse("mp4"));
            String filename = UUID.randomUUID() + "." + ext;

            Path dst = dir.resolve(filename);
            Files.copy(file.getInputStream(), dst, StandardCopyOption.REPLACE_EXISTING);

            return subDir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("保存视频文件失败", e);
        }
    }
    // [VIDEO-METHODS] 结束
}
