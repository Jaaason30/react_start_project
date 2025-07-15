package com.zusa.backend.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * AuthUtils — 辅助工具，统一获取当前登录用户 UUID
 */
@Component
public class AuthUtils {

    /**
     * 从 SecurityContext 中获取当前用户的 UUID（保存在 JWT 的 username 字段中）
     *
     * @return 当前用户 UUID
     * @throws IllegalStateException 如果未登录或 token 中无有效用户名
     */
    public UUID currentUserUuid() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("无法获取当前用户 UUID：未登录或认证信息缺失");
        }
        try {
            return UUID.fromString(auth.getName());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("JWT 中的用户名无法解析为 UUID：" + auth.getName(), ex);
        }
    }
}
