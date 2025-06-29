package com.zusa.backend.service.model;

import java.util.Set;
import java.util.UUID;

public record EditPostCmd(
        UUID     postUuid,
        String   title,
        String   content,
        Set<String> tagNames
) {}
