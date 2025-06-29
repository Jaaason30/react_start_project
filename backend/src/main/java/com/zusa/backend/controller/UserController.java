// src/main/java/com/zusa/backend/controller/UserController.java
package com.zusa.backend.controller;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestParam UUID userUuid) {
        UserDto userDto = userService.getUserProfileByUuid(userUuid);
        return ResponseEntity.ok(userDto);
    }
    // PATCH /api/user/profile
    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfile(@RequestBody UserDto req,
                                              @RequestParam UUID userUuid) {
        userService.updateProfilePartially(req, userUuid);
        return ResponseEntity.ok().build();
    }

}
