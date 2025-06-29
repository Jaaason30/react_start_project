package com.zusa.backend.repository;

import com.zusa.backend.entity.User;
import com.zusa.backend.entity.user.UserPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPhotoRepository extends JpaRepository<UserPhoto, Long> {

    /**
     * 查找用户的所有相册照片
     *
     * @param user 用户
     * @return 该用户的所有照片
     */
    List<UserPhoto> findAllByUser(User user);

    /**
     * 根据UUID查找照片
     *
     * @param uuid 照片UUID
     * @return 照片，如果不存在则为空
     */
    Optional<UserPhoto> findByUuid(UUID uuid);

    /**
     * 删除用户的所有照片
     *
     * @param user 用户
     */
    void deleteAllByUser(User user);

    /**
     * 统计用户的照片数量
     *
     * @param user 用户
     * @return 照片数量
     */
    long countByUser(User user);

    /**
     * 检查UUID对应的照片是否存在
     *
     * @param uuid 照片UUID
     * @return 如果存在则为true
     */
    boolean existsByUuid(UUID uuid);
}