// src/screens/Post/components/PostDetailHeader.tsx
console.log('### PostDetailheader file loaded');
import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { styles } from '../../../theme/PostDetailScreen.styles';

export interface PostDetailHeaderProps {
  authorAvatar: string;
  authorName: string;
  authorUuid: string;
  currentUserUuid: string;
  isFollowing: boolean;
  onBack: () => void;
  onDelete?: () => void;
  onToggleFollow: () => void;
}

const PostDetailHeader: React.FC<PostDetailHeaderProps> = ({
  authorAvatar,
  authorName,
  authorUuid,
  currentUserUuid,
  isFollowing,
  onBack,
  onDelete,
  onToggleFollow,
}) => {
  const showDeleteConfirm = () => {
    if (!onDelete) return;
    Alert.alert('确认删除', '删除后无法恢复，确定删除此帖子吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="chevron-back" size={24} />
      </TouchableOpacity>
      {currentUserUuid === authorUuid && (
        <TouchableOpacity onPress={showDeleteConfirm} style={{ marginLeft: 16 }}>
          <Ionicons name="trash-outline" size={24} color="#d81e06" />
        </TouchableOpacity>
      )}
      <FastImage
        source={{ uri: authorAvatar, headers: { 'Cache-Control': 'no-cache' } }}
        style={styles.avatar}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.authorName}>{authorName}</Text>
      {currentUserUuid !== authorUuid && (
        <TouchableOpacity
          style={isFollowing ? styles.unfollowBtn : styles.followBtn}
          onPress={onToggleFollow}
        >
          <Text style={isFollowing ? styles.unfollowText : styles.followText}>
            {isFollowing ? '取消关注' : '关注'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostDetailHeader;
