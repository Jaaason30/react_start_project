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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;  // 使用 Spring 的 @Transactional

import java.util.*;
import java.util.stream.Collectors;

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
        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到用户"));
        List<UserSummaryDto> dtos = user.getFollowers().stream()
                .sorted(Comparator.comparing(User::getNickname))
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, user.getFollowers().size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listFollowing(UUID userUuid, Pageable pageable) {
        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到用户"));
        List<UserSummaryDto> dtos = user.getFollowing().stream()
                .sorted(Comparator.comparing(User::getNickname))
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, user.getFollowing().size());
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
    @Transactional
    public void updateProfilePartially(UserDto req, UUID userUuid) {
        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new RuntimeException("找不到用户"));

        Optional.ofNullable(req.getNickname()).ifPresent(user::setNickname);
        Optional.ofNullable(req.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(req.getDateOfBirth()).ifPresent(user::setDateOfBirth);

        if (req.getCityId() != null) {
            City city = cityRepo.findById(req.getCityId())
                    .orElseThrow(() -> new RuntimeException("无效的城市 ID"));
            user.setCity(city);
        }
        if (req.getGenderId() != null) {
            Gender gender = genderRepo.findById(req.getGenderId())
                    .orElseThrow(() -> new RuntimeException("无效的性别 ID"));
            user.setGender(gender);
        }
        if (req.getGenderPreferenceIds() != null) {
            List<Gender> prefs = genderRepo.findAllById(req.getGenderPreferenceIds());
            user.setGenderPreferences(prefs);
        }

        if (req.getProfileBase64() != null && req.getProfileMime() != null) {
            UserProfilePicture pic = user.getProfilePicture();
            if (pic == null) {
                UserProfilePicture newPic = UserProfilePicture.builder()
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

        if (req.getAlbumBase64List() != null &&
                req.getAlbumMimeList() != null &&
                req.getAlbumBase64List().size() == req.getAlbumMimeList().size()) {
            List<UserPhoto> currentPhotos = new ArrayList<>(user.getAlbumPhotos());
            user.getAlbumPhotos().clear();
            userPhotoRepository.deleteAll(currentPhotos);

            List<UserPhoto> newPhotos = new ArrayList<>();
            for (int i = 0; i < req.getAlbumBase64List().size(); i++) {
                UserPhoto photo = UserPhoto.builder()
                        .uuid(UUID.randomUUID())
                        .data(req.getAlbumBase64List().get(i))
                        .mime(req.getAlbumMimeList().get(i))
                        .user(user)
                        .build();
                newPhotos.add(photo);
            }
            newPhotos = userPhotoRepository.saveAll(newPhotos);
            user.getAlbumPhotos().addAll(newPhotos);
        }

        if (req.getInterestIds() != null) {
            List<Interest> interests = interestRepo.findAllById(req.getInterestIds());
            user.setInterests(interests);
        }
        if (req.getVenueIds() != null) {
            List<Venue> venues = venueRepo.findAllById(req.getVenueIds());
            user.setPreferredVenues(venues);
        }

        userRepo.save(user);
    }
}
