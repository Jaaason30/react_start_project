// src/main/java/com/zusa/backend/service/mapper/UserMapper.java
package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.user.*;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.user.Gender;
import org.mapstruct.*;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /** 完整映射 User → UserDto */
    @Mapping(target = "shortId", source = "shortId")
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture() != null ? \"/api/media/profile/\" + user.getProfilePicture().getUuid() : null)")
    @Mapping(target = "albumUrls",
            expression = "java(user.getAlbumPhotos().stream().map(p -> \"/api/media/photo/\" + p.getUuid()).toList())")
    @Mapping(target = "cityId", source = "city.id")
    @Mapping(target = "genderId", source = "gender.id")
    @Mapping(target = "interestIds",
            expression = "java(user.getInterests().stream().map(i -> i.getId()).toList())")
    @Mapping(target = "venueIds",
            expression = "java(user.getPreferredVenues().stream().map(v -> v.getId()).toList())")
    @Mapping(target = "genderPreferenceIds",
            expression = "java(user.getGenderPreferences().stream().map(Gender::getId).toList())")
    @Mapping(target = "dates", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "gender", ignore = true)
    @Mapping(target = "genderPreferences", ignore = true)
    @Mapping(target = "interests", ignore = true)
    @Mapping(target = "preferredVenues", ignore = true)
    UserDto toDto(User user);

    @AfterMapping
    default void afterMapping(User user, @MappingTarget UserDto dto) {
        if (user.getCity() != null) {
            CityDto cd = new CityDto();
            cd.setId(user.getCity().getId());
            cd.setName(user.getCity().getName());
            dto.setCity(cd);
        }
        if (user.getGender() != null) {
            GenderDto gd = new GenderDto();
            gd.setId(user.getGender().getId());
            gd.setText(user.getGender().getText());
            dto.setGender(gd);
        }
        List<GenderDto> gps = user.getGenderPreferences().stream().map(g -> {
            GenderDto gd = new GenderDto();
            gd.setId(g.getId());
            gd.setText(g.getText());
            return gd;
        }).toList();
        dto.setGenderPreferences(gps);

        List<InterestDto> ids = user.getInterests().stream().map(i -> {
            InterestDto idto = new InterestDto();
            idto.setId(i.getId());
            idto.setName(i.getName());
            return idto;
        }).toList();
        dto.setInterests(ids);

        List<VenueDto> vds = user.getPreferredVenues().stream().map(v -> {
            VenueDto vd = new VenueDto();
            vd.setId(v.getId());
            vd.setName(v.getName());
            return vd;
        }).toList();
        dto.setPreferredVenues(vds);

        if (user.getDates() != null) {
            UserDatesDto ud = new UserDatesDto();
            ud.setCreatedAt(user.getDates().getCreatedAt());
            ud.setLastActiveAt(user.getDates().getLastActiveAt());
            dto.setDates(ud);
        }
    }

    /** 简化映射 User → UserSummaryDto */
    @Mapping(target = "shortId", source = "shortId")
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture() != null ? \"/api/media/profile/\" + user.getProfilePicture().getUuid() : null)")
    UserSummaryDto toSummaryDto(User user);
}
