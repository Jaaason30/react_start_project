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

        System.out.println("StaticResourceConfig: Serving uploads from " + uploadPath);

        registry
                .addResourceHandler("/static/uploads/**")
                .addResourceLocations("file:" + uploadPath);
    }
}
