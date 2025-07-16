// src/screens/Post/components/CommentItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { styles } from '../../../theme/PostDetailScreen.styles';
import { CommentType } from '../types';
import { ReplyItem } from './ReplyItem';
import { useUserProfile } from '../../../contexts/UserProfileContext';

export interface CommentItemProps {
  comment: CommentType;
  /** 当前用户的 shortId，可选 */
  currentUserShortId?: number;
  showReplies: boolean;
  loadingReplies: boolean;
  onLike: () => void;
  onReply: () => void;
  onDelete: () => void;
  onToggleReplies: () => void;
  onReplyLike: (replyId: string) => void;
  onReplyToReply: (reply: CommentType) => void;
  onDeleteReply: (replyId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserShortId,
  showReplies,
  loadingReplies,
  onLike,
  onReply,
  onDelete,
  onToggleReplies,
  onReplyLike,
  onReplyToReply,
  onDeleteReply,
}) => {
  // 调试输出
  console.log('[CommentItem] comment →', comment);

  const { profileData } = useUserProfile();
  const ctxShortId = profileData?.shortId;
  const meShortId = currentUserShortId ?? ctxShortId;

  // 如果 author 未定义，兜底一个空对象
  const author = comment.author 

  // 如果 replyToUser 未定义，兜底一个空对象
  const replyTo = comment.replyToUser || {
    shortId: 0,
    nickname: '',
    profilePictureUrl: undefined,
  };

  return (
    <View style={styles.commentItem}>
      <FastImage
        source={{
          uri:
            author.profilePictureUrl ||
            'https://via.placeholder.com/100x100.png?text=No+Avatar',
          headers: { 'Cache-Control': 'no-cache' },
          priority: FastImage.priority.normal,
        }}
        style={styles.commentAvatar}
        resizeMode={FastImage.resizeMode.cover}
      />

      <View style={{ flex: 1, marginLeft: 8 }}>
        <View style={styles.commentTopRow}>
          <Text style={styles.commentUser}>{author.nickname}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.likeButton} onPress={onLike}>
              <Ionicons
                name={comment.liked ? 'heart' : 'heart-outline'}
                size={16}
                color={comment.liked ? '#f33' : '#888'}
              />
              <Text
                style={[
                  styles.commentLikes,
                  comment.liked && { color: '#f33' },
                ]}
              >
                {comment.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onReply} style={{ marginLeft: 16 }}>
              <Ionicons name="chatbubble-outline" size={16} color="#888" />
            </TouchableOpacity>

            {meShortId === author.shortId && (
              <TouchableOpacity onPress={onDelete} style={{ marginLeft: 16 }}>
                <Ionicons name="trash-outline" size={16} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {comment.replyToUser && (
          <Text style={styles.replyToText}>
            回复 @{replyTo.nickname}
          </Text>
        )}

        <Text style={styles.commentContent}>{comment.content}</Text>
        <Text style={styles.commentTime}>{comment.time}</Text>

        {comment.replyCount > 0 && (
          <TouchableOpacity
            onPress={onToggleReplies}
            style={styles.viewRepliesButton}
          >
            <Text style={styles.viewRepliesText}>
              {loadingReplies
                ? '加载中...'
                : showReplies
                ? '收起回复'
                : `查看 ${comment.replyCount} 条回复`}
            </Text>
          </TouchableOpacity>
        )}

        {showReplies &&
          comment.replies?.map(reply => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserShortId={meShortId}
              onLike={() => onReplyLike(reply.id)}
              onReply={() => onReplyToReply(reply)}
              onDelete={() => onDeleteReply(reply.id)}
            />
          ))}
      </View>
    </View>
  );
};

export default CommentItem;
