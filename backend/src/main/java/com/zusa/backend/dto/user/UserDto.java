// src/main/java/com/zusa/backend/dto/user/UserDto.java
package com.zusa.backend.dto.user;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserDto {
    /* ------- 短 ID & UUID ------- */
    private Long shortId;
    private UUID uuid;

    /* ------- 基本信息 ------- */
    private String email;
    private String nickname;
    private String bio;
    private LocalDate dateOfBirth;
    private Integer age;

    /* ------- 城市 ------- */
    private CityDto city;
    private Long cityId;

    /* ------- 性别 ------- */
    private GenderDto gender;
    private Long genderId;
    private List<GenderDto> genderPreferences;
    private List<Long> genderPreferenceIds;

    /* ------- 头像 / 相册 ------- */
    private String profilePictureUrl;
    private String profileBase64;
    private String profileMime;
    private List<String> albumUrls;
    private List<String> albumBase64List;
    private List<String> albumMimeList;

    /* ------- 兴趣 / 场所 ------- */
    private List<InterestDto> interests;
    private List<Long> interestIds;
    private List<VenueDto> preferredVenues;
    private List<Long> venueIds;

    /* ------- 统计 ------- */
    private long totalLikesReceived;
    private UserDatesDto dates;
    private long followerCount;
    private long followingCount;
    private List<UserSummaryDto> followers;
    private List<UserSummaryDto> following;
}
