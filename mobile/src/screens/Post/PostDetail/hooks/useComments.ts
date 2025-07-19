// src/screens/Post/hooks/useComments.tsx

import { useState, useEffect } from 'react';
import { apiClient } from '../../../../services/apiClient';
import { API_ENDPOINTS } from '../../../../constants/api';
import { CommentType, SortType } from '../../types';
import { patchProfileUrl } from '../../utils/urlHelpers';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

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
        // 先把回复也转换成 CommentType
        const processedReplies: CommentType[] = (c.replies || []).map((r: any) => ({
          id: r.uuid,
          author: {
            shortId: r.author.shortId,
            nickname: r.author.nickname,
            profilePictureUrl:
              patchProfileUrl(r.author.profilePictureUrl, avatarVersion) ?? null,
          },
          content: r.content,
          time: new Date(r.createdAt).toLocaleString(),
          likes: r.likeCount ?? 0,
          liked: !!r.likedByCurrentUser,
          parentCommentUuid: r.parentCommentUuid ?? undefined,
          replyToUser: r.replyToUser
            ? {
                shortId: r.replyToUser.shortId,
                nickname: r.replyToUser.nickname,
                profilePictureUrl:
                  patchProfileUrl(r.replyToUser.profilePictureUrl, avatarVersion) ?? null,
              }
            : undefined,
          replyCount: 0,
          replies: [],
        }));

        // 根评论
        return {
          id: c.uuid,
          author: {
            shortId: c.author.shortId,
            nickname: c.author.nickname,
            profilePictureUrl:
              patchProfileUrl(c.author.profilePictureUrl, avatarVersion) ?? null,
          },
          content: c.content,
          time: new Date(c.createdAt).toLocaleString(),
          likes: c.likeCount ?? 0,
          liked: !!c.likedByCurrentUser,
          parentCommentUuid: c.parentCommentUuid ?? undefined,
          replyToUser: c.replyToUser
            ? {
                shortId: c.replyToUser.shortId,
                nickname: c.replyToUser.nickname,
                profilePictureUrl:
                  patchProfileUrl(c.replyToUser.profilePictureUrl, avatarVersion) ?? null,
              }
            : undefined,
          replyCount: c.replyCount ?? 0,
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
        .map((r: any) => ({
          id: r.uuid,
          author: {
            shortId: r.author.shortId,
            nickname: r.author.nickname,
            profilePictureUrl:
              patchProfileUrl(r.author.profilePictureUrl, avatarVersion) ?? null,
          },
          content: r.content,
          time: new Date(r.createdAt).toLocaleString(),
          likes: r.likeCount ?? 0,
          liked: !!r.likedByCurrentUser,
          parentCommentUuid: r.parentCommentUuid ?? undefined,
          replyToUser: r.replyToUser
            ? {
                shortId: r.replyToUser.shortId,
                nickname: r.replyToUser.nickname,
                profilePictureUrl:
                  patchProfileUrl(r.replyToUser.profilePictureUrl, avatarVersion) ?? null,
              }
            : undefined,
          replyCount: 0,
          replies: [],
        }));

      setComments(prev =>
        prev.map(c => (c.id === commentId ? { ...c, replies } : c))
      );
      setShowReplies(prev => {
        const next = new Set(prev);
        next.add(commentId);
        return next;
      });
    } catch (err) {
      console.error('[❌ fetchReplies]', err);
    } finally {
      setLoadingReplies(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
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
