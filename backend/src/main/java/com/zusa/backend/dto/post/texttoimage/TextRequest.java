package com.zusa.backend.dto.post.texttoimage;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class TextRequest {
    @NotBlank(message = "文字不能为空")
    @Size(max = 1000, message = "文字不能超过1000个字符")
    private String text;      // 支持用户在前端输入的 '\n' 换行

    private Integer styleType;
}
