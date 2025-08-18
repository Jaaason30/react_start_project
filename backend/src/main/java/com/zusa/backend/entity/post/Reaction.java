package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "post_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id","user_id","type"}),
        indexes = @Index(columnList = "createdAt")
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Reaction extends BaseEntity {

    public enum Type { LIKE, COLLECT }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Type type;
}
