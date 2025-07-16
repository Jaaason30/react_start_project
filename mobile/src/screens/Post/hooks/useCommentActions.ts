import React, { useState } from 'react';
import { Alert } from 'react-native';
import { apiClient } from '../../../services/apiClient';
import { API_ENDPOINTS, BASE_URL } from '../../../constants/api';
import { CommentType, ReplyingToType, PostType } from '../types';

export const useCommentActions = (
  postUuid: string,
  comments: CommentType[],
  setComments: React.Dispatch<React.SetStateAction<CommentType[]>>,
  setPost: React.Dispatch<React.SetStateAction<PostType | null>>,
  setShowReplies: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingToType | null>(null);

  /** 开始回复 */
  const handleReply = (comment: CommentType) => {
    setReplyingTo({
      commentId: comment.id,
      userName: comment.author.nickname,
      parentCommentUuid: comment.parentCommentUuid ?? comment.id,
      // 使用 shortId 作为回复目标用户标识
      replyToUserShortId: comment.author.shortId,
    });
    setShowCommentModal(true);
  };

  /** 删除评论 */
  const handleDeleteComment = (id: string) => {
    Alert.alert('确认删除', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(
              API_ENDPOINTS.COMMENT_DELETE.replace(':id', id)
            );
            setComments(prev => prev.filter(c => c.id !== id));
            setPost(prev =>
              prev ? { ...prev, commentCount: prev.commentCount - 1 } : prev
            );
          } catch (err) {
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  /** 提交评论或回复 */
  const submitComment = async () => {
    if (!commentText.trim()) return;
    const payload: any = {
      content: commentText.trim(),
      parentCommentUuid: replyingTo?.parentCommentUuid,
      replyToUserShortId: replyingTo?.replyToUserShortId,
    };
    try {
      const { data } = await apiClient.post<any>(
        API_ENDPOINTS.POST_COMMENTS.replace(':uuid', postUuid),
        payload
      );

      const newComment: CommentType = {
        id: data.uuid,
        author: {
          shortId: data.author.shortId,
          nickname: data.author.nickname,
          profilePictureUrl: data.author.profilePictureUrl
            ? `${BASE_URL}${data.author.profilePictureUrl}`
            : undefined,
        },
        content: data.content,
        time: new Date(data.createdAt).toLocaleString(),
        likes: 0,
        liked: false,
        replyCount: 0,
        parentCommentUuid: data.parentCommentUuid ?? undefined,
        replyToUser: data.replyToUser
          ? {
              shortId: data.replyToUser.shortId,
              nickname: data.replyToUser.nickname,
              profilePictureUrl: data.replyToUser.profilePictureUrl
                ? `${BASE_URL}${data.replyToUser.profilePictureUrl}`
                : undefined,
            }
          : undefined,
      };

      if (replyingTo) {
        setComments(prev =>
          prev.map(c =>
            c.id === replyingTo.parentCommentUuid
              ? {
                  ...c,
                  replyCount: c.replyCount + 1,
                  replies: [...(c.replies || []), newComment],
                }
              : c
          )
        );
        setShowReplies(prev => new Set(prev).add(replyingTo.parentCommentUuid!));
      } else {
        setComments(prev => [newComment, ...prev]);
      }

      setCommentText('');
      setReplyingTo(null);
      setShowCommentModal(false);
      setPost(prev =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev
      );
    } catch (err) {
      Alert.alert('发布失败', '请稍后重试');
    }
  };

  /** 切换点赞评论 */
  const toggleCommentLike = async (commentId: string) => {
    try {
      const { data: upd } = await apiClient.post<{
        likeCount: number;
        likedByCurrentUser: boolean;
      }>(
        API_ENDPOINTS.COMMENT_LIKES.replace(':id', commentId)
      );

      if (!upd) return;
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, likes: upd.likeCount, liked: upd.likedByCurrentUser }
            : c
        )
      );
    } catch (e) {
      Alert.alert('提示', '点赞失败，请稍后再试');
    }
  };

  /** 切换点赞回复 */
  const toggleReplyLike = async (replyId: string) => {
    try {
      const { data: upd } = await apiClient.post<{
        likeCount: number;
        likedByCurrentUser: boolean;
      }>(
        API_ENDPOINTS.COMMENT_LIKES.replace(':id', replyId)
      );

      if (!upd) return;
      setComments(prev =>
        prev.map(c => ({
          ...c,
          replies: c.replies?.map(r =>
            r.id === replyId
              ? { ...r, likes: upd.likeCount, liked: upd.likedByCurrentUser }
              : r
          ),
        }))
      );
    } catch {
      // noop
    }
  };

  return {
    commentText,
    setCommentText,
    showCommentModal,
    setShowCommentModal,
    replyingTo,
    setReplyingTo,
    handleReply,
    handleDeleteComment,
    submitComment,
    toggleCommentLike,
    toggleReplyLike,
  };
};
