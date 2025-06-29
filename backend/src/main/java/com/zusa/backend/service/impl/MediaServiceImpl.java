// src/main/java/com/zusa/backend/service/impl/MediaServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    /* --------------- 注入配置 --------------- */
    @Value("${app.upload.base-path}") private Path   basePath;   // 例如 /opt/zusa/uploads
    @Value("${app.upload.base-url}")  private String baseUrl;    // 例如 /static/uploads
    @Value("${app.upload.max-size-bytes}") private long  maxSize;
    @Value("${app.upload.allowed-types}")  private List<String> allowed;

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
}
