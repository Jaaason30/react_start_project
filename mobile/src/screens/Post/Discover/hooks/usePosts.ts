import { useState, useCallback, useRef } from 'react';
import { FlatList } from 'react-native';
import { apiClient } from '../../../../services/apiClient';
import { API_ENDPOINTS } from '../../../../constants/api';
import { patchUrl, patchProfileUrl } from '../../../Post/utils/urlHelpers';
import { PostType } from '../../../Post/types';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

const MIN_AUTO_REFRESH_MS = 800;

export const usePosts = () => {
  const { avatarVersion } = useUserProfile();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<PostType>>(null);

  const fetchPosts = useCallback(async () => {
    const res = await apiClient.get<{ content: any[] }>(
      `${API_ENDPOINTS.POSTS_FEED}?page=0&size=20`
    );
    if (res.error) {
      console.error('[fetchPosts] error:', res.error);
      setPosts([]);
      return;
    }
    const raw = res.data?.content ?? [];
    const data: PostType[] = raw.map(item => {
      let cover = item.coverUrl
        ? patchUrl(item.coverUrl)
        : item.coverImageUrl
        ? patchUrl(item.coverImageUrl)
        : '';
      if (!cover && Array.isArray(item.images) && item.images.length) {
        const first = item.images[0];
        cover = typeof first === 'string'
          ? patchUrl(first)
          : first?.url
          ? patchUrl(first.url)
          : '';
      }
      return {
        uuid: item.uuid,
        title: item.title,
        content: item.content,
        images: cover ? [cover] : [],
        author: {
          shortId: item.author?.shortId,
          nickname: item.author?.nickname,
          profilePictureUrl: patchProfileUrl(item.author?.profilePictureUrl, avatarVersion),
        },
        likeCount: item.likeCount ?? 0,
        collectCount: item.collectCount ?? 0,
        commentCount: item.commentCount ?? 0,
        likedByCurrentUser: !!item.likedByCurrentUser,
        collectedByCurrentUser: !!item.collectedByCurrentUser,
        followedByCurrentUser: !!item.followedByCurrentUser,
      };
    });
    setPosts(data);
  }, [avatarVersion]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await fetchPosts();
    setLoading(false);
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const triggerAutoRefresh = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    requestAnimationFrame(async () => {
      const start = Date.now();
      setRefreshing(true);
      await fetchPosts();
      const delta = Date.now() - start;
      setTimeout(() => setRefreshing(false), Math.max(MIN_AUTO_REFRESH_MS - delta, 0));
    });
  }, [fetchPosts]);

  const handleNewPost = useCallback((newPost: PostType) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleDeletePost = useCallback((postUuid: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.uuid !== postUuid));
  }, []);

  return {
    posts,
    loading,
    refreshing,
    listRef,
    loadInitial,
    onRefresh,
    triggerAutoRefresh,
    handleNewPost,
    handleDeletePost,
  };
};