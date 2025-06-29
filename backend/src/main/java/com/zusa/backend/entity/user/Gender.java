package com.zusa.backend.entity.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "genders",
        uniqueConstraints = @UniqueConstraint(columnNames = "text"))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Gender {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String text;
}
