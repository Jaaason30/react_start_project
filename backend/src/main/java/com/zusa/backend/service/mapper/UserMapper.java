package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.user.*;
import com.zusa.backend.entity.User;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /** 完整映射 User → UserDto */
    @Mapping(target = "shortId", source = "shortId")
    // Removed mapping for uuid since UserDto does not have a uuid property
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture() != null ? \"/api/media/profile/\" + user.getProfilePicture().getUuid() : null)")
    @Mapping(target = "albumUrls",
            expression = "java(user.getAlbumPhotos().stream().map(p -> \"/api/media/photo/\" + p.getUuid()).toList())")
    @Mapping(target = "interests",
            expression = "java(user.getInterests().stream().map(i -> i.getName()).toList())")
    @Mapping(target = "preferredVenues",
            expression = "java(user.getPreferredVenues().stream().map(v -> v.getName()).toList())")
    @Mapping(target = "dates", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "gender", ignore = true)
    @Mapping(target = "genderPreferences", ignore = true)
    @Mapping(target = "followerCount",
            expression = "java(user.getFollowers() != null ? user.getFollowers().size() : 0)")
    @Mapping(target = "followingCount",
            expression = "java(user.getFollowing() != null ? user.getFollowing().size() : 0)")
    UserDto toDto(User user);

    @AfterMapping
    default void afterMapping(User user, @MappingTarget UserDto dto) {
        if (user.getCity() != null) {
            CityDto cd = new CityDto();
            cd.setName(user.getCity().getName());
            dto.setCity(cd);
        }
        if (user.getGender() != null) {
            GenderDto gd = new GenderDto();
            gd.setText(user.getGender().getText());
            dto.setGender(gd);
        }
        List<GenderDto> gps = user.getGenderPreferences().stream().map(g -> {
            GenderDto gd = new GenderDto();
            gd.setText(g.getText());
            return gd;
        }).toList();
        dto.setGenderPreferences(gps);

        if (user.getDates() != null) {
            UserDatesDto ud = new UserDatesDto();
            ud.setCreatedAt(user.getDates().getCreatedAt());
            ud.setLastActiveAt(user.getDates().getLastActiveAt());
            dto.setDates(ud);
        }
    }

    /** 简化映射 User → UserSummaryDto */
    @Mapping(target = "shortId", source = "shortId")
    // Removed mapping for uuid here as well
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture() != null ? \"/api/media/profile/\" + user.getProfilePicture().getUuid() : null)")
    UserSummaryDto toSummaryDto(User user);
}
