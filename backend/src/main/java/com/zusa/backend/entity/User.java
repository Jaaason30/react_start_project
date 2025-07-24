// src/main/java/com/zusa/backend/entity/User.java
package com.zusa.backend.entity;

import com.zusa.backend.entity.user.*;
import com.zusa.backend.entity.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 短 ID，公开给前端的数字标识
     */
    @Column(name = "short_id", unique = true)
    private Long shortId;

    /** 对外安全 UUID */
    @Builder.Default
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "uuid", columnDefinition = "BINARY(16)", nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    /** 用户角色 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;


    /** 登录邮箱 */
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    /** 密码（返回时掩码） */
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    /** 用户昵称 */
    private String nickname;

    /** 个性签名 */
    @Column(length = 255)
    private String bio;

    /** 出生日期 */
    private LocalDate dateOfBirth;

    /** 头像 */
    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_picture_id")
    private UserProfilePicture profilePicture;

    /** 相册 */
    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<UserPhoto> albumPhotos = new ArrayList<>();

    /** 活跃时间 */
    @OneToOne(cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "dates_id")
    @Builder.Default
    private UserDates dates = new UserDates();

    /** 性别 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private Gender gender;

    /** 交友意向性别 */
    @ManyToMany
    @JoinTable(name = "user_gender_pref",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "gender_id"))
    private List<Gender> genderPreferences = new ArrayList<>();

    /** 城市 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    /** 兴趣 */
    @ManyToMany
    @JoinTable(name = "user_interest",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id"))
    private List<Interest> interests = new ArrayList<>();

    /** 场所偏好 */
    @ManyToMany
    @JoinTable(name = "user_venue",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "venue_id"))
    private List<Venue> preferredVenues = new ArrayList<>();

    /** 粉丝 / 关注 */
// 当前用户“关注了”哪些人（关注别人）
    @ManyToMany
    @JoinTable(
            name = "user_follow",
            joinColumns = @JoinColumn(name = "follower_id"),       // 当前用户
            inverseJoinColumns = @JoinColumn(name = "followee_id") // 目标用户
    )
    private Set<User> following = new HashSet<>();

    // 当前用户的“粉丝”有哪些人（被别人关注）
    @ManyToMany(mappedBy = "following")
    private Set<User> followers = new HashSet<>();

    /** 累计收到的“赞”数 */
    @Column(nullable = false)
    @Builder.Default
    private int likes = 0;

    /** 计算年龄 */
    public int getAge() {
        return dateOfBirth == null
                ? 0
                : LocalDate.now().getYear() - dateOfBirth.getYear();
    }

    @PostLoad
    @PostPersist
    @PostUpdate
    private void initCollectionsIfNull() {
        if (genderPreferences == null) genderPreferences = new ArrayList<>();
        if (interests == null) interests = new ArrayList<>();
        if (preferredVenues == null) preferredVenues = new ArrayList<>();
        if (albumPhotos == null) albumPhotos = new ArrayList<>();
    }
}
