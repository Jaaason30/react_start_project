// src/screens/Post/components/ReplyItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { styles } from '../../../theme/PostDetailScreen.styles';
import { CommentType } from '../types';
import { useUserProfile } from '../../../contexts/UserProfileContext';

interface ReplyItemProps {
  reply: CommentType;
  currentUserShortId?: number;
  onLike: () => void;
  onReply: () => void;
  onDelete: () => void;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  currentUserShortId,
  onLike,
  onReply,
  onDelete,
}) => {
  const { profileData } = useUserProfile();
  const meShortId = currentUserShortId ?? profileData?.shortId;
  const isAuthor = meShortId === reply.author.shortId;

  return (
    <View style={[styles.commentItem, styles.replyItem]}>
      <FastImage
        source={{
          uri:
            reply.author.profilePictureUrl ||
            'https://via.placeholder.com/100x100.png?text=No+Avatar',
          headers: { 'Cache-Control': 'no-cache' },
          priority: FastImage.priority.normal,
        }}
        style={styles.commentAvatar}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <View style={styles.commentTopRow}>
          <Text style={styles.commentUser}>{reply.author.nickname}</Text>
          {reply.replyToUser && (
            <Text style={styles.replyToInline}>
              回复 @{reply.replyToUser.nickname}
            </Text>
          )}
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.likeButton} onPress={onLike}>
              <Ionicons
                name={reply.liked ? 'heart' : 'heart-outline'}
                size={14}
                color={reply.liked ? '#f33' : '#888'}
              />
              <Text
                style={[
                  styles.replyLikes,
                  reply.liked && { color: '#f33' },
                ]}
              >
                {reply.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onReply} style={{ marginLeft: 12 }}>
              <Ionicons name="chatbubble-outline" size={14} color="#888" />
            </TouchableOpacity>

            {isAuthor && (
              <TouchableOpacity onPress={onDelete} style={{ marginLeft: 12 }}>
                <Ionicons name="trash-outline" size={14} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.replyContent}>{reply.content}</Text>
        <Text style={styles.replyTime}>{reply.time}</Text>
      </View>
    </View>
  );
};

export default ReplyItem;