package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "tags",
        uniqueConstraints = @UniqueConstraint(columnNames = "name"),
        indexes = @Index(columnList = "name")
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tag extends BaseEntity {

    /** 标签名称（唯一） */
    @Builder.Default
    @Column(nullable = false, length = 64, unique = true)
    private String name = "";
}
