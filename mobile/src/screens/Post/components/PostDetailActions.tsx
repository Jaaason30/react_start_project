// src/screens/Post/components/PostDetailActions.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../theme/PostDetailScreen.styles';
import type { PostType } from '../types';
interface PostDetailActionsProps {
  post: PostType;
  isLiked: boolean;
  isCollected: boolean;
  onLike: () => void;
  onCollect: () => void;
  onCommentToggle: () => void;
}

const PostDetailActions: React.FC<PostDetailActionsProps> = ({
  post,
  isLiked,
  isCollected,
  onLike,
  onCollect,
  onCommentToggle,
}) => (
  <View style={styles.actions}>
    <TouchableOpacity style={styles.commentInput} onPress={onCommentToggle}>
      <Ionicons name="pencil-outline" size={16} color="#888" />
      <Text style={styles.commentText}>说点什么…</Text>
    </TouchableOpacity>
    <View style={styles.rightActions}>
      <TouchableOpacity style={styles.actionItem} onPress={onLike}>
        <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#f33' : '#888'} />
        <Text style={[styles.count, isLiked && { color: '#f33' }]}>{post.likeCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={onCollect}>
        <Ionicons name={isCollected ? 'star' : 'star-outline'} size={22} color={isCollected ? '#fc0' : '#888'} />
        <Text style={[styles.count, isCollected && { color: '#fc0' }]}>{post.collectCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={onCommentToggle}>
        <Ionicons name="chatbubble-outline" size={22} />
        <Text style={styles.count}>{post.commentCount}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default PostDetailActions;
