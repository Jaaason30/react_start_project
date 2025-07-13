import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../../theme/PostDetailScreen.styles';
import { PostType } from '../types';

interface PostHeaderProps {
  post: PostType;
  isFollowing: boolean;
  currentUserUuid?: string;
  onFollow: () => void;
  onDelete: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  isFollowing,
  currentUserUuid,
  onFollow,
  onDelete,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} />
      </TouchableOpacity>
      {currentUserUuid === post.authorUuid && (
        <TouchableOpacity
          onPress={onDelete}
          style={{ marginLeft: 16 }}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#d81e06"
          />
        </TouchableOpacity>
      )}
      <FastImage
        source={{
          uri: post.authorAvatar,
          headers: { 'Cache-Control': 'no-cache' },
          priority: FastImage.priority.high,
        }}
        style={styles.avatar}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.authorName}>{post.author}</Text>
      {currentUserUuid !== post.authorUuid && (
        <TouchableOpacity
          style={
            isFollowing
              ? styles.unfollowBtn
              : styles.followBtn
          }
          onPress={onFollow}
        >
          <Text
            style={
              isFollowing
                ? styles.unfollowText
                : styles.followText
            }
          >
            {isFollowing ? '取消关注' : '关注'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};