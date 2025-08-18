// src/main/java/com/zusa/backend/entity/City.java
package com.zusa.backend.entity.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cities", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class City {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;
}
