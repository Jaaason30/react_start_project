import { Alert } from 'react-native';
import { apiClient } from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api';
import { PostType } from '../types';

export const usePostActions = (
  postUuid: string,
  post: PostType | null,
  setPost: React.Dispatch<React.SetStateAction<PostType | null>>,
  isFollowing: boolean,
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLiked: React.Dispatch<React.SetStateAction<boolean>>,
  setIsCollected: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const toggleFollow = async () => {
    if (!post) return;
    try {
      if (isFollowing) {
        await apiClient.delete(
          `${API_ENDPOINTS.USER_FOLLOW}?targetUuid=${post.authorUuid}`
        );
      } else {
        await apiClient.post(
          `${API_ENDPOINTS.USER_FOLLOW}?targetUuid=${post.authorUuid}`
        );
      }
      setIsFollowing(prev => !prev);
    } catch (err) {
      Alert.alert(isFollowing ? '取消关注失败' : '关注失败');
    }
  };

  const toggleReaction = async (type: 'LIKE' | 'COLLECT') => {
    try {
      const response = await apiClient.post<any>(
        `${API_ENDPOINTS.POST_REACTIONS.replace(':uuid', postUuid)}`,
        { type }
      );
      
      if (!response.data) {
        Alert.alert('操作失败', '服务器响应异常，请稍后重试');
        return;
      } 
      
      const { data } = response;
      
      setPost(prev =>
        prev
          ? {
              ...prev,
              likeCount: data.likeCount ?? prev.likeCount,
              collectCount: data.collectCount ?? prev.collectCount,
              commentCount: data.commentCount ?? prev.commentCount,
              likedByCurrentUser: data.likedByCurrentUser ?? false,
              collectedByCurrentUser: data.collectedByCurrentUser ?? false,
            }
          : prev
      );
      
      setIsLiked(data.likedByCurrentUser ?? false);
      setIsCollected(data.collectedByCurrentUser ?? false);
      
    } catch (err) {
      Alert.alert('操作失败', '网络错误，请稍后重试');
    }
  };

  return {
    toggleFollow,
    toggleReaction,
  };
};