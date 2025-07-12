// src/main/java/com/zusa/backend/security/JwtUtils.java
package com.zusa.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 Access Token，将用户 UUID 作为 subject 存入 token
     * 并在 claim 中添加 email
     */
    public String generateAccessToken(UUID userUuid, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiryMs);

        return Jwts.builder()
                .setSubject(userUuid.toString())
                .claim("email", email)
                .claim("type", "ACCESS")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 生成 Refresh Token，将用户 UUID 作为 subject
     */
    public String generateRefreshToken(UUID userUuid) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiryMs);

        return Jwts.builder()
                .setSubject(userUuid.toString())
                .claim("type", "REFRESH")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 验证 token 是否有效
     */
    public boolean validateToken(String token) {
        try {
            getParser().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 获取 JwtParser（兼容 io.jsonwebtoken 0.9.x）
     */
    private JwtParser getParser() {
        return Jwts.parser()
                .setSigningKey(getSigningKey());
    }

    /**
     * 从 token 中获取 subject（UUID 字符串）
     */
    public UUID getUserUuidFromToken(String token) {
        Claims claims = getParser()
                .parseClaimsJws(token)
                .getBody();
        return UUID.fromString(claims.getSubject());
    }

    /**
     * 从 token 中获取用户 email
     */
    public String getEmailFromToken(String token) {
        Claims claims = getParser()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("email", String.class);
    }

    /**
     * 从 token 中获取 token 类型 ACCESS or REFRESH
     */
    public String getTokenType(String token) {
        Claims claims = getParser()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("type", String.class);
    }
}
