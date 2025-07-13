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
  currentUserUuid?: string;
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

export const CommentItem: React.FC<CommentItemProps> = (props) => {
  const { profileData } = useUserProfile();
  const ctxUuid = profileData?.uuid;

  // ✅ 使用 props 中传入的 UUID，否则 fallback 到 context
  const currentUserUuid = props.currentUserUuid ?? ctxUuid;

  // —— 在这里打印 currentUserUuid
  console.log('[CommentItem] currentUserUuid =', currentUserUuid);

  const {
    comment,
    showReplies,
    loadingReplies,
    onLike,
    onReply,
    onDelete,
    onToggleReplies,
    onReplyLike,
    onReplyToReply,
    onDeleteReply,
  } = props;

  console.log(
    `[CommentItem] id=${comment.id}, liked=${comment.liked}, likes=${comment.likes}, content="${comment.content}"`
  );

  return (
    <View style={styles.commentItem}>
      <FastImage
        source={{
          uri: comment.avatar,
          headers: { 'Cache-Control': 'no-cache' },
          priority: FastImage.priority.normal,
        }}
        style={styles.commentAvatar}
        resizeMode={FastImage.resizeMode.cover}
      />

      <View style={{ flex: 1, marginLeft: 8 }}>
        <View style={styles.commentTopRow}>
          <Text style={styles.commentUser}>{comment.user}</Text>
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

            {currentUserUuid === comment.authorUuid && (
              <TouchableOpacity onPress={onDelete} style={{ marginLeft: 16 }}>
                <Ionicons name="trash-outline" size={16} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {comment.replyToUser && (
          <Text style={styles.replyToText}>
            回复 @{comment.replyToUser.nickname}
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
          comment.replies?.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserUuid={currentUserUuid}
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
