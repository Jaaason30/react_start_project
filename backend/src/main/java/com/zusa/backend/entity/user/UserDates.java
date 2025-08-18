package com.zusa.backend.entity.user;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 存储用户的创建时间、最后活跃时间等
 */
@Entity
@Table(name = "user_dates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDates {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;

    /**
     * 如果你想双向保持跟 User 的关系：
     * 只写 mappedBy，不要额外放 @JoinColumn
     */
    @OneToOne(mappedBy = "dates", fetch = FetchType.LAZY)
    @JsonIgnore
    private User user;
}
