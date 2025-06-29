package com.zusa.backend.entity.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_photos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String data;

    @Column(length = 40)
    private String mime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
