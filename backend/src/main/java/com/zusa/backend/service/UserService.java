// ================= UserService.java =================
package com.zusa.backend.service;

import com.zusa.backend.dto.user.UserDto;

import java.util.UUID;

public interface UserService {

    UserDto register(String email, String rawPassword, String nickname);

    UserDto login(String username, String rawPassword);

    UserDto getUserProfileByUuid(UUID uuid);

    void updateProfilePartially(UserDto req, UUID userUuid);
}
