// src/main/java/com/zusa/backend/service/impl/UserServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.user.*;
import com.zusa.backend.repository.*;
import com.zusa.backend.service.UserService;
import com.zusa.backend.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final GenderRepository genderRepo;
    private final InterestRepository interestRepo;
    private final VenueRepository venueRepo;
    private final CityRepository cityRepo;
    private final UserProfilePictureRepository userProfilePictureRepo;
    private final UserPhotoRepository userPhotoRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserDto register(String email, String rawPassword, String nickname) {
        userRepo.findByEmail(email).ifPresent(u -> {
            throw new RuntimeException("邮箱已被注册");
        });

        User u = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .nickname(nickname)
                .build();
        userRepo.save(u);
        return userMapper.toDto(u);
    }

    @Override
    @Transactional
    public void follow(UUID userUuid, UUID targetUuid) {
        if (userUuid.equals(targetUuid)) {
            throw new RuntimeException("不能关注自己");
        }
        User me = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到当前用户"));
        User target = userRepo.findByUuid(targetUuid)
                .orElseThrow(() -> new RuntimeException("找不到目标用户"));

        if (me.getFollowing().add(target)) {
            target.getFollowers().add(me);
            userRepo.saveAll(List.of(me, target));
        }
    }

    @Override
    @Transactional
    public void unfollow(UUID userUuid, UUID targetUuid) {
        User me = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到当前用户"));
        User target = userRepo.findByUuid(targetUuid)
                .orElseThrow(() -> new RuntimeException("找不到目标用户"));

        if (me.getFollowing().remove(target)) {
            target.getFollowers().remove(me);
            userRepo.saveAll(List.of(me, target));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listFollowers(UUID userUuid, Pageable pageable) {
        return userRepo.findFollowersByUuid(userUuid, pageable)
                .map(userMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listFollowing(UUID userUuid, Pageable pageable) {
        return userRepo.findFollowingByUuid(userUuid, pageable)
                .map(userMapper::toSummaryDto);
    }

    @Override
    @Transactional
    public UserDto login(String username, String rawPassword) {
        User u = userRepo.findByNickname(username)
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));
        if (!passwordEncoder.matches(rawPassword, u.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        return userMapper.toDto(u);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfileByUuid(UUID uuid) {
        User user = userRepo.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("找不到用户"));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfileByShortId(Long shortId) {
        User user = userRepo.findByShortId(shortId)
                .orElseThrow(() -> new RuntimeException("找不到用户"));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void updateProfilePartially(UserDto req, UUID userUuid) {
        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到用户"));

        // 仅更新可编辑字段
        Optional.ofNullable(req.getNickname()).ifPresent(user::setNickname);
        Optional.ofNullable(req.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(req.getDateOfBirth()).ifPresent(user::setDateOfBirth);

        if (req.getCityId() != null) {
            cityRepo.findById(req.getCityId())
                    .ifPresent(user::setCity);
        }
        if (req.getGenderId() != null) {
            genderRepo.findById(req.getGenderId())
                    .ifPresent(user::setGender);
        }
        if (req.getGenderPreferenceIds() != null) {
            var prefs = genderRepo.findAllById(req.getGenderPreferenceIds());
            user.setGenderPreferences(prefs);
        }

        // 头像
        if (req.getProfileBase64() != null && req.getProfileMime() != null) {
            var pic = user.getProfilePicture();
            if (pic == null) {
                var newPic = UserProfilePicture.builder()
                        .uuid(UUID.randomUUID())
                        .data(req.getProfileBase64())
                        .mime(req.getProfileMime())
                        .build();
                newPic.setUser(user);
                user.setProfilePicture(newPic);
            } else {
                pic.setData(req.getProfileBase64());
                pic.setMime(req.getProfileMime());
            }
        }

        // 相册
        if (req.getAlbumBase64List() != null && req.getAlbumMimeList() != null
                && req.getAlbumBase64List().size() == req.getAlbumMimeList().size()) {
            var old = List.copyOf(user.getAlbumPhotos());
            user.getAlbumPhotos().clear();
            userPhotoRepository.deleteAll(old);

            var newPhotos = IntStream.range(0, req.getAlbumBase64List().size())
                    .mapToObj(i -> UserPhoto.builder()
                            .uuid(UUID.randomUUID())
                            .data(req.getAlbumBase64List().get(i))
                            .mime(req.getAlbumMimeList().get(i))
                            .user(user)
                            .build())
                    .toList();
            userPhotoRepository.saveAll(newPhotos);
            user.getAlbumPhotos().addAll(newPhotos);
        }

        if (req.getInterestIds() != null) {
            var ints = interestRepo.findAllById(req.getInterestIds());
            user.setInterests(ints);
        }
        if (req.getVenueIds() != null) {
            var vns = venueRepo.findAllById(req.getVenueIds());
            user.setPreferredVenues(vns);
        }

        userRepo.save(user);
    }
}
