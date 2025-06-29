package com.zusa.backend.entity.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import com.zusa.backend.entity.User;
import java.util.UUID;

/**
 * 存储用户头像的二进制数据
 */
@Entity
@Table(name = "user_profile_picture")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfilePicture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 对外展示的 UUID（方便前端直接用 UUID 来访问） */
    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    /** 二进制数据 */
    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String data;

    /** MIME 类型，比如 image/png */
    @Column(length = 40)
    private String mime;

    /**
     * （可选）如果你希望双向关联，就只在这里写 mappedBy，
     * 不要再写 @JoinColumn，否则会产生第二个外键映射。
     */
    @OneToOne(mappedBy = "profilePicture", fetch = FetchType.LAZY)
    @JsonIgnore
    private User user;
}
