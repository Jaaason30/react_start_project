// src/main/java/com/zusa/backend/config/StaticResourceConfig.java

package com.zusa.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 自动获取当前用户主目录
        String userHome = System.getProperty("user.home");

        // 上传文件真实路径: /Users/你的用户名/Desktop/Uploads/
        String uploadPath = userHome + "/Desktop/Uploads/";

        // 文字转图片专用路径
        String textImagePath = uploadPath + "text-images/";

        System.out.println("StaticResourceConfig: Serving uploads from " + uploadPath);
        System.out.println("StaticResourceConfig: Serving text-images from " + textImagePath);

        // 原有的上传文件路径配置
        registry
                .addResourceHandler("/static/uploads/**")
                .addResourceLocations("file:" + uploadPath);

        // 新增：文字转图片的静态资源路径
        registry
                .addResourceHandler("/static/text-images/**")
                .addResourceLocations("file:" + textImagePath);
    }
}