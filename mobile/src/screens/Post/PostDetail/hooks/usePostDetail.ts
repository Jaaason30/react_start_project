// src/screens/Post/hooks/usePostDetail.tsx

import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../../../services/apiClient';
import { API_ENDPOINTS } from '../../../../constants/api';
import { PostType } from '../../types';
import { patchUrl, patchProfileUrl } from '../../utils/urlHelpers';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

export const usePostDetail = (postUuid: string) => {
  const { profileData, avatarVersion } = useUserProfile();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  /** 获取帖子详情 */
  const fetchPostDetail = async () => {
    try {
      const url = `${API_ENDPOINTS.POST_DETAIL}/${postUuid}`;
      console.log('[usePostDetail] Fetching post detail from:', url);
      const { data } = await apiClient.get<any>(url);

      // 处理作者头像 URL
      const rawProfileUrl = data.author?.profilePictureUrl;
      const profileUrl = patchProfileUrl(rawProfileUrl, avatarVersion) || null;
      console.log('[usePostDetail] response data →', data);
      // 处理帖子图片列表
      const processedImages: string[] = (data.images || []).map((img: any) =>
        patchUrl(img.url) || img.url
      );

      const newPost: PostType = {
        uuid: data.uuid,
        title: data.title,
        content: data.content,
        images: processedImages,
        author: {
          shortId: data.author.shortId,
          nickname: data.author.nickname,
          profilePictureUrl: profileUrl,
        },
        likeCount: data.likeCount ?? 0,
        collectCount: data.collectCount ?? 0,
        commentCount: data.commentCount ?? 0,
        likedByCurrentUser: !!data.likedByCurrentUser,
        collectedByCurrentUser: !!data.collectedByCurrentUser,
        followedByCurrentUser: data.followedByCurrentUser ?? false,
      };

      // 更新状态
      setPost(newPost);
      setIsLiked(newPost.likedByCurrentUser);
      setIsCollected(newPost.collectedByCurrentUser);
      setIsFollowing(newPost.followedByCurrentUser);
    } catch (err) {
      console.error('[usePostDetail] 请求失败', err);
      Alert.alert('加载失败', '无法获取帖子详情，请稍后重试');
    }
  };

  /** 删除帖子 */
  const deletePost = async (): Promise<boolean> => {
    if (!post) return false;
    try {
      const url = `${API_ENDPOINTS.POST_DETAIL}/${post.uuid}`;
      console.log('[usePostDetail] Deleting post at:', url);
      await apiClient.delete(url);
      return true;
    } catch (err) {
      console.error('[usePostDetail] 删除失败', err);
      Alert.alert('删除失败', '请稍后重试');
      return false;
    }
  };

  // 初次加载 & postUuid 变化时
  useEffect(() => {
    setLoading(true);
    fetchPostDetail().finally(() => setLoading(false));
  }, [postUuid]);

  // 如果当前用户是作者，头像更新后刷新
  useEffect(() => {
    if (post?.author.shortId === profileData?.shortId) {
      fetchPostDetail();
    }
  }, [profileData?.profilePictureUrl]);

  // 页面聚焦时，如果是自己的帖子，刷新详情
  useFocusEffect(
    React.useCallback(() => {
      if (post?.author.shortId === profileData?.shortId) {
        fetchPostDetail();
      }
    }, [post?.author.shortId, profileData?.shortId])
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
    currentUserShortId: profileData?.shortId,
  };
};
