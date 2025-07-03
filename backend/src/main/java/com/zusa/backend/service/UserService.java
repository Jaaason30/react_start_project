// ================= UserService.java =================
package com.zusa.backend.service;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserDto register(String email, String rawPassword, String nickname);

    UserDto login(String username, String rawPassword);

    UserDto getUserProfileByUuid(UUID uuid);

    void updateProfilePartially(UserDto req, UUID userUuid);

    // ----- 关注／粉丝 -----
    void follow(UUID userUuid, UUID targetUuid);

    void unfollow(UUID userUuid, UUID targetUuid);

    Page<UserSummaryDto> listFollowers(UUID userUuid, Pageable pageable);

    Page<UserSummaryDto> listFollowing(UUID userUuid, Pageable pageable);
}