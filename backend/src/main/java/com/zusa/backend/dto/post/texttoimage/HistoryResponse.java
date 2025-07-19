package com.zusa.backend.dto.post.texttoimage;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistoryResponse {
    private Long id;
    private String text;
    private String imageUrl;
    private LocalDateTime createdAt;
}