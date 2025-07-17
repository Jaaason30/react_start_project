// src/main/java/com/zusa/backend/service/impl/UserServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.user.GenderDto;
import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.user.UserPhoto;
import com.zusa.backend.entity.user.UserProfilePicture;
import com.zusa.backend.entity.User;
import com.zusa.backend.repository.*;
import com.zusa.backend.service.UserService;
import com.zusa.backend.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
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

    // 1) 注册 / 登录

    @Override
    @Transactional
    public UserDto register(String email, String rawPassword, String nickname) {
        userRepo.findByEmail(email).ifPresent(u -> {
            throw new IllegalArgumentException("邮箱已被注册");
        });

        long shortId = generateUniqueShortId();

        User u = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .nickname(nickname)
                .shortId(shortId)
                .build();

        userRepo.save(u);
        return userMapper.toDto(u);
    }

    private long generateUniqueShortId() {
        long shortId;
        do {
            shortId = 100000 + new Random().nextInt(900000); // 生成 100000 - 999999 之间的数字
        } while (userRepo.existsByShortId(shortId));
        return shortId;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto login(String username, String rawPassword) {
        Optional<User> opt = username.contains("@")
                ? userRepo.findByEmail(username)
                : userRepo.findByNickname(username);
        User u = opt.orElseThrow(() -> new BadCredentialsException("用户名或密码错误"));
        if (!passwordEncoder.matches(rawPassword, u.getPassword())) {
            throw new BadCredentialsException("用户名或密码错误");
        }
        return userMapper.toDto(u);
    }

    // 2) 用户资料查询

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfileByUuid(UUID uuid) {
        log.info("[🔍 getUserProfileByUuid] UUID = {}", uuid);
        User user = userRepo.findByUuid(uuid)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + uuid));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfileByShortId(Long shortId) {
        log.info("[🔍 getUserProfileByShortId] shortId = {}", shortId);
        User user = userRepo.findByShortId(shortId)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + shortId));
        return userMapper.toDto(user);
    }

    // 新增：通过 shortId 更新资料（委托给 updateProfilePartially）

    @Override
    @Transactional
    public void updateProfileByShortId(UserDto req, Long shortId) {
        User user = userRepo.findByShortId(shortId)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + shortId));
        updateProfilePartially(req, user.getUuid());
    }

    // 3) 关注 / 取关 (UUID)

    @Override
    @Transactional
    public void follow(UUID userUuid, UUID targetUuid) {
        if (userUuid.equals(targetUuid)) {
            throw new IllegalArgumentException("不能关注自己");
        }

        User follower = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new UsernameNotFoundException("找不到当前用户"));
        User target = userRepo.findByUuid(targetUuid)
                .orElseThrow(() -> new UsernameNotFoundException("找不到目标用户"));

        if (!follower.getFollowing().contains(target)) {
            follower.getFollowing().add(target);
            userRepo.save(follower); // 让 JPA 自动插入关系记录
            log.info("[Follow] {} (UUID={}) 关注了 {} (UUID={})",
                    follower.getNickname(), follower.getUuid(),
                    target.getNickname(), target.getUuid());
        }
    }

    @Override
    @Transactional
    public void unfollow(UUID userUuid, UUID targetUuid) {
        User follower = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new UsernameNotFoundException("找不到当前用户"));
        User target = userRepo.findByUuid(targetUuid)
                .orElseThrow(() -> new UsernameNotFoundException("找不到目标用户"));

        if (follower.getFollowing().contains(target)) {
            follower.getFollowing().remove(target);
            userRepo.save(follower); // 自动更新中间表
            log.info("[Unfollow] {} (UUID={}) 取消关注 {} (UUID={})",
                    follower.getNickname(), follower.getUuid(),
                    target.getNickname(), target.getUuid());
        }
    }

    // 关注 / 取关 (shortId)

    @Override
    @Transactional
    public void followByShortId(UUID userUuid, Long targetShortId) {
        User target = userRepo.findByShortId(targetShortId)
                .orElseThrow(() -> new UsernameNotFoundException("找不到目标用户"));

        log.info("[follow] 当前用户 UUID = {}, 目标用户 shortId = {}, UUID = {}", userUuid, targetShortId, target.getUuid());

        follow(userUuid, target.getUuid());
    }

    @Override
    @Transactional
    public void unfollowByShortId(UUID userUuid, Long targetShortId) {
        User target = userRepo.findByShortId(targetShortId)
                .orElseThrow(() -> new UsernameNotFoundException("找不到目标用户"));
        unfollow(userUuid, target.getUuid());
    }

    // 4) 粉丝 / 关注列表

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
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listFollowersByShortId(Long shortId, Pageable pageable) {
        User u = userRepo.findByShortId(shortId)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + shortId));
        return listFollowers(u.getUuid(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listFollowingByShortId(Long shortId, Pageable pageable) {
        User u = userRepo.findByShortId(shortId)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + shortId));
        return listFollowing(u.getUuid(), pageable);
    }

    // 5) 部分更新资料 (头像 / 相册 / 其他字段)

    @Override
    @Transactional
    public void updateProfilePartially(UserDto req, UUID userUuid) {
        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new UsernameNotFoundException("找不到用户"));

        // ---------- 头像处理 ----------
        if (req.getProfileBase64() != null && req.getProfileMime() != null) {
            log.info("[AvatarUpload] 用户 UUID: {}，Mime: {}，Base64 长度: {}",
                    userUuid, req.getProfileMime(), req.getProfileBase64().length());
            UserProfilePicture pic = user.getProfilePicture();
            if (pic == null) {
                pic = UserProfilePicture.builder()
                        .uuid(UUID.randomUUID())
                        .data(req.getProfileBase64())
                        .mime(req.getProfileMime())
                        .user(user)
                        .build();
                user.setProfilePicture(pic);
            } else {
                pic.setData(req.getProfileBase64());
                pic.setMime(req.getProfileMime());
            }
            userProfilePictureRepo.save(pic);
        }

        // ---------- 相册处理 ----------
        if (req.getKeepAlbumUrls() != null) {
            log.info("[AlbumUpload] 用户 UUID: {}，保留旧图 {} 张",
                    userUuid, req.getKeepAlbumUrls().size());
            List<UserPhoto> keep = new ArrayList<>();
            for (String url : req.getKeepAlbumUrls()) {
                user.getAlbumPhotos().stream()
                        .filter(p -> url.contains(p.getUuid().toString()))
                        .findFirst()
                        .ifPresent(keep::add);
            }
            List<UserPhoto> toDelete = new ArrayList<>(user.getAlbumPhotos());
            toDelete.removeAll(keep);
            user.getAlbumPhotos().clear();
            user.getAlbumPhotos().addAll(keep);
            userPhotoRepository.deleteAll(toDelete);
            log.info("[AlbumUpload] 删除旧图 {} 张", toDelete.size());
        }

        if (req.getAlbumBase64List() != null &&
                req.getAlbumMimeList() != null &&
                req.getAlbumBase64List().size() == req.getAlbumMimeList().size()) {
            log.info("[AlbumUpload] 新增 {} 张图片", req.getAlbumBase64List().size());
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

        // ---------- 其余字段 ----------

        Optional.ofNullable(req.getNickname()).ifPresent(user::setNickname);
        Optional.ofNullable(req.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(req.getDateOfBirth()).ifPresent(user::setDateOfBirth);

        if (req.getCity() != null && req.getCity().getName() != null) {
            cityRepo.findByName(req.getCity().getName()).ifPresent(user::setCity);
        }
        if (req.getGender() != null && req.getGender().getText() != null) {
            genderRepo.findByText(req.getGender().getText()).ifPresent(user::setGender);
        }
        if (req.getGenderPreferences() != null && !req.getGenderPreferences().isEmpty()) {
            List<String> texts = req.getGenderPreferences().stream()
                    .map(GenderDto::getText)
                    .toList();
            user.setGenderPreferences(genderRepo.findAllByTextIn(texts));
        }
        if (req.getInterests() != null && !req.getInterests().isEmpty()) {
            user.setInterests(interestRepo.findAllByNameIn(req.getInterests()));
        }
        if (req.getPreferredVenues() != null && !req.getPreferredVenues().isEmpty()) {
            user.setPreferredVenues(venueRepo.findAllByNameIn(req.getPreferredVenues()));
        }

        userRepo.save(user);
    }

    // 6) 辅助查询

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .map(userMapper::toDto)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByUuid(UUID uuid) {
        return userRepo.findByUuid(uuid)
                .map(userMapper::toDto)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + uuid));
    }
}
