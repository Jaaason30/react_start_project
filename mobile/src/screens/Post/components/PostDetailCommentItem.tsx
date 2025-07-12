// src/screens/Post/components/PostDetailCommentItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../theme/PostDetailScreen.styles';
import type { CommentType } from '../types';

interface PostDetailCommentItemProps {
  comment: CommentType;
  showReplies: boolean;
  loadingReplies: boolean;
  onToggleReplies: (commentId: string) => void;
  onReply: (comment: CommentType) => void;
  onDelete: (id: string) => void;
  onLike: (id: string, isReply: boolean, parentId?: string) => void;
}

export const PostDetailCommentItem: React.FC<PostDetailCommentItemProps> = ({
  comment,
  showReplies,
  loadingReplies,
  onToggleReplies,
  onReply,
  onDelete,
  onLike,
}) => (
  <View style={styles.commentItem}>
    <FastImage
      source={{ uri: comment.avatar, headers: { 'Cache-Control': 'no-cache' } }}
      style={styles.commentAvatar}
      resizeMode={FastImage.resizeMode.cover}
    />
    <View style={{ flex: 1, marginLeft: 8 }}>
      {/* 用户名行 */}
      <View style={styles.commentTopRow}>
        <Text style={styles.commentUser}>{comment.user}</Text>
      </View>

      {/* （可选）回复目标 */}
      {comment.replyToUser && (
        <Text style={styles.replyToText}>回复 @{comment.replyToUser.nickname}</Text>
      )}

      {/* 评论内容 */}
      <Text style={styles.commentContent}>{comment.content}</Text>
      <Text style={styles.commentTime}>{comment.time}</Text>

      {/* 图标动作行：靠右对齐并等距 */}
      <View style={styles.commentActionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(comment.id, false)}
        >
          <Ionicons
            name={comment.liked ? 'heart' : 'heart-outline'}
            size={16}
            color={comment.liked ? '#f33' : '#888'}
          />
          <Text style={[styles.commentActionText, comment.liked && { color: '#f33' }]}>
            {comment.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onReply(comment)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#888" />
          <Text style={styles.commentActionText}>{comment.replyCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(comment.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#888" />
        </TouchableOpacity>
      </View>

      {/* 查看／收起回复 */}
      {comment.replyCount > 0 && (
        <TouchableOpacity
          onPress={() => onToggleReplies(comment.id)}
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

      {/* 嵌套回复列表 */}
      {showReplies && comment.replies?.map(reply => (
        <View key={reply.id} style={[styles.commentItem, styles.replyItem]}>
          <FastImage
            source={{ uri: reply.avatar, headers: { 'Cache-Control': 'no-cache' } }}
            style={styles.commentAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.commentUser}>{reply.user}</Text>
            {reply.replyToUser && (
              <Text style={styles.replyToInline}>
                回复 @{reply.replyToUser.nickname}
              </Text>
            )}
            <Text style={styles.replyContent}>{reply.content}</Text>
            <Text style={styles.replyTime}>{reply.time}</Text>
            {/* 嵌套回复的图标行同上 */}
            <View style={styles.commentActionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onLike(reply.id, true, comment.id)}
              >
                <Ionicons
                  name={reply.liked ? 'heart' : 'heart-outline'}
                  size={14}
                  color={reply.liked ? '#f33' : '#888'}
                />
                <Text style={[styles.commentActionText, reply.liked && { color: '#f33' }]}>
                  {reply.likes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onReply(reply)}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#888" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(reply.id)}
              >
                <Ionicons name="trash-outline" size={14} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  </View>
);
