import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api';
import { CommentType, SortType } from '../types';
import { patchProfileUrl } from '../utils/urlHelpers';
import { useUserProfile } from '../../../contexts/UserProfileContext';

export const useComments = (postUuid: string) => {
  const { avatarVersion } = useUserProfile();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeSort, setActiveSort] = useState<SortType>('最新');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  const fetchComments = async (pageNumber = 0) => {
    try {
      const sortParam = activeSort === '最新' ? 'LATEST' : 'HOT';

      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.POST_COMMENTS.replace(':uuid', postUuid)}` +
          `?sortType=${sortParam}` +
          `&page=${pageNumber}&size=10&loadReplies=true`
      );

      const newComments: CommentType[] = (data.content || []).map((c: any) => {
        console.log('[🧩 CommentDto]', c);

        const processedReplies: CommentType[] = (c.replies || []).map((r: any) => {
          console.log('[🧩 ReplyDto]', r);

          return {
            id: r.uuid,
            authorUuid: r.author.uuid,
            user: r.author.nickname,
            avatar:
              patchProfileUrl(r.author.profilePictureUrl, avatarVersion) ||
              'https://via.placeholder.com/100x100.png?text=No+Avatar',
            content: r.content,
            time: new Date(r.createdAt).toLocaleString(),
            likes: r.likeCount ?? 0,
            liked: !!r.likedByCurrentUser,
            parentCommentUuid: r.parentCommentUuid,
            replyToUser: r.replyToUser,
            replyCount: 0,
          };
        });

        return {
          id: c.uuid,
          authorUuid: c.author.uuid,
          user: c.author.nickname,
          avatar:
            patchProfileUrl(c.author.profilePictureUrl, avatarVersion) ||
            'https://via.placeholder.com/100x100.png?text=No+Avatar',
          content: c.content,
          time: new Date(c.createdAt).toLocaleString(),
          likes: c.likeCount ?? 0,
          liked: !!c.likedByCurrentUser,
          parentCommentUuid: c.parentCommentUuid,
          replyToUser: c.replyToUser,
          replyCount: c.replyCount || 0,
          replies: processedReplies,
        };
      });

      setComments(prev =>
        pageNumber === 0 ? newComments : [...prev, ...newComments]
      );
      setHasMore(!data.last);
    } catch (err) {
      console.error('[❌ fetchComments]', err);
    }
  };

  const fetchReplies = async (commentId: string) => {
    setLoadingReplies(prev => new Set(prev).add(commentId));

    try {
      const url = `${API_ENDPOINTS.COMMENT_REPLIES.replace(':id', commentId)}?page=0&size=20`;
      const { data } = await apiClient.get<any>(url);

      const replies: CommentType[] = (data.content || [])
        .filter((r: any) => r != null)
        .map((r: any) => {
          console.log('[🧩 Fetched Reply]', r);

          return {
            id: r.uuid,
            authorUuid: r.author.uuid,
            user: r.author.nickname,
            avatar: patchProfileUrl(r.author.profilePictureUrl, avatarVersion) ||
                    'https://via.placeholder.com/100x100.png?text=No+Avatar',
            content: r.content,
            time: new Date(r.createdAt).toLocaleString(),
            likes: r.likeCount,
            liked: !!r.likedByCurrentUser,
            parentCommentUuid: r.parentCommentUuid,
            replyToUser: r.replyToUser,
            replyCount: 0,
          };
        });

      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, replies } : c
        )
      );

      setShowReplies(prev => {
        const newSet = new Set(prev);
        newSet.add(commentId);
        return newSet;
      });
    } catch (err) {
      console.error('[❌ fetchReplies]', err);
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchComments(0);
    setPage(0);
  }, [postUuid, activeSort]);

  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchComments(next);
  };

  return {
    comments,
    setComments,
    activeSort,
    setActiveSort,
    hasMore,
    showReplies,
    setShowReplies,
    loadingReplies,
    fetchComments,
    fetchReplies,
    loadMore,
  };
};
