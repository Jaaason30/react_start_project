package com.zusa.backend.service.impl;

import com.zusa.backend.dto.user.GenderDto;
import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.user.*;
import com.zusa.backend.repository.*;
import com.zusa.backend.service.UserService;
import com.zusa.backend.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
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
    public UserDto login(String username, String rawPassword) {
        Optional<User> opt = username.contains("@")
                ? userRepo.findByEmail(username)
                : userRepo.findByNickname(username);

        User u = opt.orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!passwordEncoder.matches(rawPassword, u.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        return userMapper.toDto(u);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfileByUuid(UUID uuid) {
        log.info("[🔍 getUserProfileByUuid] 查询 UUID: {}", uuid);

        User user = userRepo.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("[❌ getUserProfileByUuid] 用户不存在，UUID: {}", uuid);
                    return new UsernameNotFoundException("用户不存在222: " + uuid);
                });

        log.info("[✅ getUserProfileByUuid] 查询成功，昵称: {}, 邮箱: {}", user.getNickname(), user.getEmail());
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
    public void updateProfilePartially(UserDto req, UUID userUuid) {
        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到用户"));

        // ========== 头像上传 ==========
        if (req.getProfileBase64() != null && req.getProfileMime() != null) {
            log.info("[AvatarUpload] 用户 UUID: {}", userUuid);
            log.info("[AvatarUpload] 接收到头像上传，Mime: {}, Base64 长度: {}",
                    req.getProfileMime(),
                    req.getProfileBase64().length());

            var pic = user.getProfilePicture();
            if (pic == null) {
                var newPic = UserProfilePicture.builder()
                        .uuid(UUID.randomUUID())
                        .data(req.getProfileBase64())
                        .mime(req.getProfileMime())
                        .build();
                newPic.setUser(user);
                user.setProfilePicture(newPic);
                log.info("[AvatarUpload] 新头像已创建，UUID: {}", newPic.getUuid());
            } else {
                pic.setData(req.getProfileBase64());
                pic.setMime(req.getProfileMime());
                log.info("[AvatarUpload] 已更新现有头像，UUID: {}", pic.getUuid());
            }
        }

        // ========== 相册上传 ==========
        if (req.getAlbumBase64List() != null && req.getAlbumMimeList() != null
                && req.getAlbumBase64List().size() == req.getAlbumMimeList().size()) {

            log.info("[AlbumUpload] 用户 UUID: {}", userUuid);
            log.info("[AlbumUpload] 接收到 {} 张相册图片上传", req.getAlbumBase64List().size());

            for (int i = 0; i < req.getAlbumBase64List().size(); i++) {
                log.info("[AlbumUpload] 第 {} 张图片 - Mime: {}, Base64 长度: {}",
                        i + 1,
                        req.getAlbumMimeList().get(i),
                        req.getAlbumBase64List().get(i).length());
            }

            var old = List.copyOf(user.getAlbumPhotos());
            user.getAlbumPhotos().clear();
            userPhotoRepository.deleteAll(old);
            log.info("[AlbumUpload] 已删除用户旧相册，共 {} 张", old.size());

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

            log.info("[AlbumUpload] 已保存新相册，共 {} 张", newPhotos.size());
            newPhotos.forEach(photo ->
                    log.info("[AlbumUpload] 新增图片 UUID: {}", photo.getUuid())
            );
        }

        // ========== 其余字段更新 ==========
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
            var genderTexts = req.getGenderPreferences().stream().map(GenderDto::getText).toList();
            var prefs = genderRepo.findAllByTextIn(genderTexts);
            user.setGenderPreferences(prefs);
        }
        if (req.getInterests() != null && !req.getInterests().isEmpty()) {
            var ints = interestRepo.findAllByNameIn(req.getInterests());
            user.setInterests(ints);
        }
        if (req.getPreferredVenues() != null && !req.getPreferredVenues().isEmpty()) {
            var vns = venueRepo.findAllByNameIn(req.getPreferredVenues());
            user.setPreferredVenues(vns);
        }

        userRepo.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在222: " + email));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByUuid(UUID uuid) {
        log.info("[🔍 getUserByUuid] 接收到查询请求，UUID: {}", uuid);

        User user = userRepo.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("[❌ getUserByUuid] 用户不存在，UUID: {}", uuid);
                    return new UsernameNotFoundException("用户不存在111: " + uuid);
                });

        log.info("[✅ getUserByUuid] 查询成功，昵称: {}, 邮箱: {}", user.getNickname(), user.getEmail());
        return userMapper.toDto(user);
    }
}
