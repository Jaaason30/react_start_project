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

    /** 映射完整的 User → UserDto，手动处理复杂字段 */
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
    @Mapping(target = "dates", ignore = true)                 // @AfterMapping 填充
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "gender", ignore = true)
    @Mapping(target = "genderPreferences", ignore = true)
    @Mapping(target = "interests", ignore = true)
    @Mapping(target = "preferredVenues", ignore = true)
    UserDto toDto(User user);

    @AfterMapping
    default void afterMapping(User user, @MappingTarget UserDto dto) {
        // CityDto
        if (user.getCity() != null) {
            CityDto cityDto = new CityDto();
            cityDto.setId(user.getCity().getId());
            cityDto.setName(user.getCity().getName());
            dto.setCity(cityDto);
        }

        // GenderDto
        if (user.getGender() != null) {
            GenderDto genderDto = new GenderDto();
            genderDto.setId(user.getGender().getId());
            genderDto.setText(user.getGender().getText());
            dto.setGender(genderDto);
        }

        // GenderPreferences
        List<GenderDto> genderPreferences = user.getGenderPreferences().stream()
                .map(g -> {
                    GenderDto gd = new GenderDto();
                    gd.setId(g.getId());
                    gd.setText(g.getText());
                    return gd;
                })
                .collect(Collectors.toList());
        dto.setGenderPreferences(genderPreferences);

        // Interests
        List<InterestDto> interestDtos = user.getInterests().stream()
                .map(i -> {
                    InterestDto idto = new InterestDto();
                    idto.setId(i.getId());
                    idto.setName(i.getName());
                    return idto;
                })
                .collect(Collectors.toList());
        dto.setInterests(interestDtos);

        // Venues
        List<VenueDto> venueDtos = user.getPreferredVenues().stream()
                .map(v -> {
                    VenueDto vdto = new VenueDto();
                    vdto.setId(v.getId());
                    vdto.setName(v.getName());
                    return vdto;
                })
                .collect(Collectors.toList());
        dto.setPreferredVenues(venueDtos);

        // UserDatesDto
        if (user.getDates() != null) {
            UserDatesDto datesDto = new UserDatesDto();
            datesDto.setCreatedAt(user.getDates().getCreatedAt());
            datesDto.setLastActiveAt(user.getDates().getLastActiveAt());
            dto.setDates(datesDto);
        }
    }

    /** 简化版：User → UserSummaryDto，只含 UUID、昵称、头像 URL */
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture() != null ? \"/api/media/profile/\" + user.getProfilePicture().getUuid() : null)")
    UserSummaryDto toSummaryDto(User user);
}
