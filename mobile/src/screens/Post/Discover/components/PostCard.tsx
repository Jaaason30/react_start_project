import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import VideoPlayer from '../../../../components/VideoPlayer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../../../theme/DiscoverScreen.styles';
import { PostType } from '../../types';
import { RootStackParamList } from '../../../../App';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface PostCardProps {
  item: PostType;
  onDeleteSuccess?: (postUuid: string) => void;
  isFirstVideo?: boolean;  // 是否为第一个视频
  isVisible?: boolean;     // 是否在可视区域内
}

export const PostCard: React.FC<PostCardProps> = ({ item, onDeleteSuccess, isFirstVideo = false, isVisible = true }) => {
  const navigation = useNavigation<Navigation>();
  const { avatarVersion } = useUserProfile();
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [uri, setUri] = useState(() => {
<<<<<<< HEAD
    if (item.mediaType === 'VIDEO' || item.mediaType === 'MIXED') {
=======
    if (item.mediaType === 'VIDEO') {
>>>>>>> c99daa6 (Initial commit - Clean project state)
      // 优先使用视频封面，然后是视频本身，最后是占位符
      const coverUrl = item.videoCoverUrl || item.videoUrl || 'https://via.placeholder.com/400x600';
      console.log('[PostCard] 视频帖子封面URL:', coverUrl);
      return coverUrl;
    }
    return item.images[0] || 'https://via.placeholder.com/400x600';
  });

  // 第一个视频自动播放逻辑
  useEffect(() => {
<<<<<<< HEAD
    if ((item.mediaType === 'VIDEO' || item.mediaType === 'MIXED') && 
=======
    if ((item.mediaType === 'VIDEO' ) && 
>>>>>>> c99daa6 (Initial commit - Clean project state)
        isFirstVideo && 
        isVisible && 
        item.videoUrl) {
      console.log('[PostCard] 第一个视频自动播放:', item.uuid);
      // 延迟1秒后显示视频播放器
      const timer = setTimeout(() => {
        setShowVideoPlayer(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setShowVideoPlayer(false);
    }
  }, [item.mediaType, item.videoUrl, isFirstVideo, isVisible, item.uuid]);

  useEffect(() => {
<<<<<<< HEAD
    if (item.mediaType === 'VIDEO' || item.mediaType === 'MIXED') {
=======
    if (item.mediaType === 'VIDEO') {
>>>>>>> c99daa6 (Initial commit - Clean project state)
      const coverUrl = item.videoCoverUrl || item.videoUrl || 'https://via.placeholder.com/400x600';
      console.log('[PostCard] 更新视频封面URL:', {
        uuid: item.uuid,
        mediaType: item.mediaType,
        videoCoverUrl: item.videoCoverUrl,
        videoUrl: item.videoUrl,
        finalUrl: coverUrl
      });
      setUri(coverUrl);
    } else {
      setUri(item.images[0] || 'https://via.placeholder.com/400x600');
    }
  }, [item.images, item.mediaType, item.videoCoverUrl, item.videoUrl]);

  const goProfile = () => {
    if (item.author.shortId != null) {
      navigation.navigate('PlayerProfile', { shortId: item.author.shortId });
    } else {
      navigation.navigate('PlayerProfile', {});
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PostDetail', { 
        post: item,
        onDeleteSuccess
      })}
    >
      <View style={styles.cardImageContainer}>
<<<<<<< HEAD
        {showVideoPlayer && (item.mediaType === 'VIDEO' || item.mediaType === 'MIXED') && item.videoUrl ? (
=======
        {showVideoPlayer && (item.mediaType === 'VIDEO' ) && item.videoUrl ? (
>>>>>>> c99daa6 (Initial commit - Clean project state)
          // 显示视频播放器
          <VideoPlayer
            source={item.videoUrl}
            poster={item.videoCoverUrl}
            style={styles.cardImage}
            autoPlay={true}
            defaultMuted={true}
            persistentControls={true}
            onPress={() => navigation.navigate('PostDetail', { 
              post: item,
              onDeleteSuccess
            })}
          />
        ) : (
          // 显示封面图片
          <FastImage
            source={{ uri }}
            style={styles.cardImage}
            resizeMode={FastImage.resizeMode.cover}
            onError={() => setUri('https://via.placeholder.com/400x600')}
          />
        )}
        
        {/* 视频播放角标 - 只在显示封面时显示 */}
<<<<<<< HEAD
        {(item.mediaType === 'VIDEO' || item.mediaType === 'MIXED') && !showVideoPlayer && (
=======
        {(item.mediaType === 'VIDEO' ) && !showVideoPlayer && (
>>>>>>> c99daa6 (Initial commit - Clean project state)
          <View style={styles.videoOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="#fff" />
            </View>
            {/* 视频时长显示 */}
            {item.videoMetadata?.durationSeconds && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {Math.floor(item.videoMetadata.durationSeconds / 60)}:{String(item.videoMetadata.durationSeconds % 60).padStart(2, '0')}
                </Text>
              </View>
            )}
          </View>
        )}
        
<<<<<<< HEAD
        {/* 混合媒体标识 */}
        {item.mediaType === 'MIXED' && (
          <View style={styles.mixedMediaBadge}>
            <Ionicons name="library" size={16} color="#fff" />
            <Text style={styles.mixedMediaText}>混合</Text>
          </View>
        )}
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title || '（无标题）'}
      </Text>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.authorContainer} onPress={goProfile} activeOpacity={0.7}>
          <FastImage
            key={`${item.author.shortId}-${avatarVersion}`}
            source={{ uri: item.author.profilePictureUrl || '' }}
            style={styles.authorAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <Text style={styles.author}>{item.author.nickname}</Text>
        </TouchableOpacity>
        <View style={styles.likesRow}>
          <Ionicons name="heart-outline" size={14} color="#888" />
          <Text style={styles.likesText}>{item.likeCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};