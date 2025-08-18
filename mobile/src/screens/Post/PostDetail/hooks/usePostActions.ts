// src/screens/Post/hooks/usePostActions.tsx

import { Alert } from 'react-native';
import { apiClient } from '../../../../services/apiClient';
import { API_ENDPOINTS } from '../../../../constants/api';
import { PostType } from '../../types';

export const usePostActions = (
  postUuid: string,
  post: PostType | null,
  setPost: React.Dispatch<React.SetStateAction<PostType | null>>,
  isFollowing: boolean,
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>,
  isLiked: boolean,
  setIsLiked: React.Dispatch<React.SetStateAction<boolean>>,
  isCollected: boolean,
  setIsCollected: React.Dispatch<React.SetStateAction<boolean>>
) => {
  /** 切换关注 / 取关 —— 使用 nested author.shortId */
  const toggleFollow = async () => {
    if (!post) return;
    try {
      const url = `${API_ENDPOINTS.USER_FOLLOW_SHORT}/${post.author.shortId}`;
      if (isFollowing) {
        await apiClient.delete(url);
      } else {
        await apiClient.post(url);
      }
      setIsFollowing(!isFollowing);
    } catch {
      Alert.alert(isFollowing ? '取消关注失败' : '关注失败');
    }
  };

  /** 切换点赞 / 收藏 —— 同步所有状态 */
  const toggleReaction = async (type: 'LIKE' | 'COLLECT') => {
    if (!post) return;
    try {
      const { data } = await apiClient.post<{
        likeCount: number;
        collectCount: number;
        commentCount: number;
        likedByCurrentUser: boolean;
        collectedByCurrentUser: boolean;
      }>(
        API_ENDPOINTS.POST_REACTIONS.replace(':uuid', postUuid),
        { type }
      );

      if (!data) {
        Alert.alert('操作失败', '服务器响应异常，请稍后重试');
        return;
      }

      // 先更新 post 对象
      setPost(prev =>
        prev
          ? {
              ...prev,
              likeCount: data.likeCount,
              collectCount: data.collectCount,
              commentCount: data.commentCount,
              likedByCurrentUser: data.likedByCurrentUser,
              collectedByCurrentUser: data.collectedByCurrentUser,
            }
          : prev
      );

      // 再同步本地 isLiked/isCollected
      setIsLiked(data.likedByCurrentUser);
      setIsCollected(data.collectedByCurrentUser);
    } catch {
      Alert.alert('操作失败', '网络错误，请稍后重试');
    }
  };

  return {
    toggleFollow,
    toggleReaction,
  };
};
