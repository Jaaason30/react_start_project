package com.zusa.backend.dto.post.texttoimage;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class TextRequest {
    @NotBlank(message = "文字不能为空")
    @Size(max = 30, message = "文字不能超过30个字符")
    private String text;
    private Integer styleType;
}

