package com.zusa.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import jakarta.annotation.PostConstruct;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;

@EnableJpaAuditing
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)

@SpringBootApplication
public class LoginApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoginApplication.class, args);
    }

    /** 启动时自动创建上传文件夹，避免上传时报错 */
    @PostConstruct
    public void initUploadsFolder() throws IOException {
        String userHome = System.getProperty("user.home");
        String uploadPath = userHome + "/Desktop/Uploads/post";
        Files.createDirectories(Paths.get(uploadPath));
        System.out.println("Ensured upload path exists: " + uploadPath);
    }
}
