import React,{ useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api';
import { PostType } from '../types';
import { patchUrl, patchProfileUrl } from '../utils/urlHelpers';
import { useUserProfile } from '../../../contexts/UserProfileContext';

export const usePostDetail = (postUuid: string) => {
  const { profileData, avatarVersion } = useUserProfile();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchPostDetail = async () => {
    try {
      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.POST_DETAIL}/${postUuid}`
      );

      const avatarUrl =
        patchProfileUrl(data.author?.profilePictureUrl, avatarVersion) ||
        'https://via.placeholder.com/200x200.png?text=No+Avatar';

      const processedImages = (data.images || []).map(
        (img: any) => patchUrl(img.url) || img.url
      );

      const newPost: PostType = {
        uuid: data.uuid,
        title: data.title,
        content: data.content,
        images: processedImages,
        author: data.author?.nickname || '未知用户',
        authorAvatar: avatarUrl,
        authorUuid: data.author?.uuid,
        likeCount: data.likeCount ?? 0,
        collectCount: data.collectCount ?? 0,
        commentCount: data.commentCount ?? 0,
        likedByCurrentUser: !!data.likedByCurrentUser,
        collectedByCurrentUser: !!data.collectedByCurrentUser,
        followedByCurrentUser: data.followedByCurrentUser ?? false,
      };

      setPost(newPost);
      setIsLiked(!!data.likedByCurrentUser);
      setIsCollected(!!data.collectedByCurrentUser);
      setIsFollowing(newPost.followedByCurrentUser);
    } catch (err) {
      Alert.alert('加载失败', '无法获取帖子详情');
    }
  };

  const deletePost = async () => {
    if (!post) return;
    
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.POST_DETAIL}/${post.uuid}`
      );
      return true;
    } catch (err) {
      Alert.alert('删除失败', '请稍后重试');
      return false;
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchPostDetail();
      setLoading(false);
    };
    loadInitial();
  }, [postUuid]);

  // 当用户头像更新时，如果是当前用户的帖子，刷新帖子详情
  useEffect(() => {
    if (post?.authorUuid === profileData?.uuid) {
      fetchPostDetail();
    }
  }, [profileData?.profilePictureUrl]);

  // 使用 useFocusEffect 确保页面聚焦时刷新
  useFocusEffect(
    React.useCallback(() => {
      if (post?.authorUuid === profileData?.uuid) {
        fetchPostDetail();
      }
      return () => {};
    }, [post?.authorUuid, profileData?.uuid])
  );

  return {
    post,
    setPost,
    loading,
    isLiked,
    setIsLiked,
    isCollected,
    setIsCollected,
    isFollowing,
    setIsFollowing,
    fetchPostDetail,
    deletePost,
    currentUserUuid: profileData?.uuid,
  };
};