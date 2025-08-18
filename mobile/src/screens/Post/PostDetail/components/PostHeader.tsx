// src/screens/Post/components/PostHeader.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../../../theme/PostDetailScreen.styles';
import { PostType } from '../../types';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

interface PostHeaderProps {
  post: PostType;
  isFollowing: boolean;
  /** 当前用户的 shortId，可选 */
  currentUserShortId?: number;
  onFollow: () => void;
  onDelete: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  isFollowing,
  currentUserShortId,
  onFollow,
  onDelete,
}) => {
  const navigation = useNavigation();
  const ctxShortId = useUserProfile().profileData?.shortId;
  const meShortId = currentUserShortId ?? ctxShortId;

  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} />
      </TouchableOpacity>

      {meShortId === post.author.shortId && (
        <TouchableOpacity onPress={onDelete} style={{ marginLeft: 16 }}>
          <Ionicons name="trash-outline" size={24} color="#d81e06" />
        </TouchableOpacity>
      )}

      <FastImage
        source={{
          uri:
            post.author.profilePictureUrl ||
            'https://via.placeholder.com/200x200.png?text=No+Avatar',
          headers: { 'Cache-Control': 'no-cache' },
          priority: FastImage.priority.high,
        }}
        style={styles.avatar}
        resizeMode={FastImage.resizeMode.cover}
      />

      <Text style={styles.authorName}>{post.author.nickname}</Text>

      {meShortId !== post.author.shortId && (
        <TouchableOpacity
          style={isFollowing ? styles.unfollowBtn : styles.followBtn}
          onPress={onFollow}
        >
          <Text style={isFollowing ? styles.unfollowText : styles.followText}>
            {isFollowing ? '取消关注' : '关注'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostHeader;
