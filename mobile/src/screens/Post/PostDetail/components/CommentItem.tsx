import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { styles } from '../../../../theme/PostDetailScreen.styles';
import { CommentType } from '../../types';
import { ReplyItem } from './ReplyItem';
import { useUserProfile } from '../../../../contexts/UserProfileContext';
import { patchProfileUrl } from '../../utils/urlHelpers';

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
  /** 删除回复时需要父评论 id，方便更新本地 state */
  onDeleteReply: (replyId: string, parentId: string) => void;
  onReplyToReply: (reply: CommentType) => void;
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
  onDeleteReply,
  onReplyToReply,
}) => {
  const { profileData, avatarVersion } = useUserProfile();
  const ctxShortId = profileData?.shortId;
  const meShortId = currentUserShortId ?? ctxShortId;

  // author 兜底
  const author = comment.author || {
    shortId: 0,
    nickname: '',
    profilePictureUrl: undefined as string | null | undefined,
  };

  const replyTo = comment.replyToUser || {
    shortId: 0,
    nickname: '',
    profilePictureUrl: undefined as string | null | undefined,
  };

  // ---- 头像（带版本号，击穿缓存）----
  const authorAvatarUri =
    patchProfileUrl(author.profilePictureUrl, avatarVersion) ||
    'https://via.placeholder.com/100x100.png?text=No+Avatar';

  return (
    <View style={styles.commentItem}>
      <FastImage
        key={`${author.shortId}-${avatarVersion}`} // 版本变化强制重建
        source={{
          uri: authorAvatarUri,
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
          <Text style={styles.replyToText}>回复 @{replyTo.nickname}</Text>
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
              currentUserShortId={meShortId}
              onLike={() => onReplyLike(reply.id)}
              onReply={() => onReplyToReply(reply)}
              onDelete={() => onDeleteReply(reply.id, comment.id)}
            />
          ))}
      </View>
    </View>
  );
};

export default CommentItem;
