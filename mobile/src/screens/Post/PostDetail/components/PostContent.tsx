import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, Alert, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VideoPlayer from '../../../../components/VideoPlayer';
import { styles } from '../../../../theme/PostDetailScreen.styles';
import { PostType } from '../../types';

const { width } = Dimensions.get('window');

interface PostContentProps {
  post: PostType;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const PostContent: React.FC<PostContentProps> = ({ post, onFullscreenChange }) => {
  const [imageDimensions, setImageDimensions] = useState<
    { width: number; height: number }[]
  >([]);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [videoDataValid, setVideoDataValid] = useState(true); // 默认为true，简化逻辑
<<<<<<< HEAD
  const [autoFullscreenTriggered, setAutoFullscreenTriggered] = useState(false);

  // 检查图片尺寸 - 简化版本
  useEffect(() => {
    if (!post?.images?.length) return;
    
=======
  // const [autoFullscreenTriggered, setAutoFullscreenTriggered] = useState(false);

  // 检查图片尺寸 - 简化版本
  useEffect(() => {
    if (!post?.images?.length) {return;}

>>>>>>> c99daa6 (Initial commit - Clean project state)
    (async () => {
      try {
        const dims = await Promise.all(
          post.images.map(
            url =>
              new Promise<{ width: number; height: number }>(resolve => {
                Image.getSize(
                  url,
                  (w, h) => resolve({ width: w, height: h }),
                  () => resolve({ width, height: width })
                );
              })
          )
        );
        setImageDimensions(dims);
      } catch (error) {
        console.error('[PostContent] Error loading image dimensions:', error);
      }
    })();
  }, [post?.images]);

  // 简化视频验证逻辑
  useEffect(() => {
<<<<<<< HEAD
    if (post?.mediaType === 'VIDEO' || post?.mediaType === 'MIXED') {
=======
    if (post?.mediaType === 'VIDEO') {
>>>>>>> c99daa6 (Initial commit - Clean project state)
      console.log('[PostContent] Video post detected:', {
        uuid: post.uuid,
        mediaType: post.mediaType,
        videoUrl: post.videoUrl,
<<<<<<< HEAD
        videoCoverUrl: post.videoCoverUrl
      });
      setVideoDataValid(!!post.videoUrl);
    }
  }, [post?.mediaType, post?.videoUrl, post?.videoCoverUrl]);
=======
        videoCoverUrl: post.videoCoverUrl,
      });
      setVideoDataValid(!!post.videoUrl);
    }
  }, [post?.mediaType, post?.videoUrl, post?.videoCoverUrl, post?.uuid]);
>>>>>>> c99daa6 (Initial commit - Clean project state)

  // 暂时禁用自动全屏播放逻辑
  /*
  useEffect(() => {
<<<<<<< HEAD
    if ((post?.mediaType === 'VIDEO' || post?.mediaType === 'MIXED') && 
        videoDataValid && 
        !autoFullscreenTriggered && 
        !isVideoFullscreen) {
      
      console.log('[PostContent] 检测到视频帖子，准备自动全屏播放');
      
=======
    if (post?.mediaType === 'VIDEO' &&
        videoDataValid &&
        !autoFullscreenTriggered &&
        !isVideoFullscreen) {

      console.log('[PostContent] 检测到视频帖子，准备自动全屏播放');

>>>>>>> c99daa6 (Initial commit - Clean project state)
      // 延迟1.5秒后自动进入全屏，给用户适应时间
      const timer = setTimeout(() => {
        console.log('[PostContent] 触发自动全屏播放');
        setIsVideoFullscreen(true);
        setAutoFullscreenTriggered(true);
        onFullscreenChange?.(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [post?.mediaType, videoDataValid, autoFullscreenTriggered, isVideoFullscreen]);
  */

  const handleVideoPress = () => {
    if (!videoDataValid) {
      Alert.alert('视频无效', '该视频无法播放，数据可能已损坏或丢失');
      return;
    }

<<<<<<< HEAD
    const videoInfo = post.videoMetadata ? 
      `时长: ${Math.floor(post.videoMetadata.durationSeconds / 60)}:${String(post.videoMetadata.durationSeconds % 60).padStart(2, '0')}\n` +
      `大小: ${(post.videoMetadata.sizeBytes / (1024 * 1024)).toFixed(1)}MB\n` +
      `分辨率: ${post.videoMetadata.width}x${post.videoMetadata.height}\n` +
      `格式: ${post.videoMetadata.mimeType || '未知'}` : 
=======
    // 直接进入全屏模式
    setIsVideoFullscreen(true);
    onFullscreenChange?.(true);
  };

  const handleVideoLongPress = () => {
    if (!videoDataValid) {
      Alert.alert('视频无效', '该视频无法播放，数据可能已损坏或丢失');
      return;
    }

    const videoInfo = post.videoMetadata ?
      `时长: ${Math.floor(post.videoMetadata.durationSeconds / 60)}:${String(post.videoMetadata.durationSeconds % 60).padStart(2, '0')}\n` +
      `大小: ${(post.videoMetadata.sizeBytes / (1024 * 1024)).toFixed(1)}MB\n` +
      `分辨率: ${post.videoMetadata.width}x${post.videoMetadata.height}\n` +
      `格式: ${post.videoMetadata.mimeType || '未知'}` :
>>>>>>> c99daa6 (Initial commit - Clean project state)
      '视频信息不可用';

    const options = [];

    // 全屏预览选项
    if (post.videoCoverUrl || post.videoUrl) {
      options.push({
        text: '全屏预览',
        onPress: () => {
          setIsVideoFullscreen(true);
          onFullscreenChange?.(true);
<<<<<<< HEAD
        }
=======
        },
>>>>>>> c99daa6 (Initial commit - Clean project state)
      });
    }

    // 外部播放器选项
    if (post.videoUrl) {
      options.push({
        text: '用外部播放器打开',
        onPress: () => {
          Linking.canOpenURL(post.videoUrl!).then(supported => {
            if (supported) {
              Linking.openURL(post.videoUrl!);
            } else {
              Alert.alert('无法打开', '设备上没有支持该视频格式的应用');
            }
          }).catch(() => {
            Alert.alert('打开失败', '无法启动外部播放器');
          });
<<<<<<< HEAD
        }
=======
        },
>>>>>>> c99daa6 (Initial commit - Clean project state)
      });
    }

    // 复制链接选项
    if (post.videoUrl) {
      options.push({
        text: '复制视频链接',
        onPress: () => {
          // 这里可以添加复制到剪贴板的功能
          Alert.alert('链接复制', `视频链接:\n${post.videoUrl}`);
<<<<<<< HEAD
        }
=======
        },
>>>>>>> c99daa6 (Initial commit - Clean project state)
      });
    }

    // 调试信息选项
    options.push({
      text: '技术信息',
      onPress: () => {
<<<<<<< HEAD
        Alert.alert('技术信息', 
=======
        Alert.alert('技术信息',
>>>>>>> c99daa6 (Initial commit - Clean project state)
          `视频URL: ${post.videoUrl || '无'}\n` +
          `封面URL: ${post.videoCoverUrl || '无'}\n` +
          `媒体类型: ${post.mediaType}\n\n${videoInfo}`
        );
<<<<<<< HEAD
      }
=======
      },
>>>>>>> c99daa6 (Initial commit - Clean project state)
    });

    options.push({
      text: '取消',
<<<<<<< HEAD
      style: 'cancel' as const
    });

    Alert.alert(
      '视频选项', 
=======
      style: 'cancel' as const,
    });

    Alert.alert(
      '视频选项',
>>>>>>> c99daa6 (Initial commit - Clean project state)
      `${videoInfo}\n\n选择操作：`,
      options
    );
  };

<<<<<<< HEAD
  const handleExitFullscreen = () => {
    setIsVideoFullscreen(false);
    onFullscreenChange?.(false);
  };
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)

  // 通知父组件全屏状态变化
  useEffect(() => {
    onFullscreenChange?.(isVideoFullscreen);
  }, [isVideoFullscreen, onFullscreenChange]);

  console.log('[PostContent] Rendering post:', {
    uuid: post.uuid,
    mediaType: post.mediaType,
    hasImages: !!post.images?.length,
    hasVideo: !!post.videoUrl,
<<<<<<< HEAD
    videoDataValid
=======
    videoDataValid,
>>>>>>> c99daa6 (Initial commit - Clean project state)
  });

  return (
    <>
      {/* 视频内容 */}
<<<<<<< HEAD
      {(post.mediaType === 'VIDEO' || post.mediaType === 'MIXED') ? (
=======
      {post.mediaType === 'VIDEO' ? (
>>>>>>> c99daa6 (Initial commit - Clean project state)
        <View style={styles.videoContainer}>
          {videoDataValid && post.videoUrl ? (
            <>
              <VideoPlayer
                source={post.videoUrl}
                poster={post.videoCoverUrl}
                style={styles.videoPlayer}
                autoPlay={false}
                defaultMuted={true}
                onError={(error) => {
                  console.error('[PostContent] Video error:', error);
                  Alert.alert('播放错误', '视频播放失败，请尝试其他操作');
                }}
                onLoad={(data) => {
                  console.log('[PostContent] Video loaded:', data);
                }}
              />
<<<<<<< HEAD
              <TouchableOpacity 
                style={styles.fullscreenBtn}
                onPress={handleVideoPress}
=======
              <TouchableOpacity
                style={styles.fullscreenBtn}
                onPress={handleVideoPress}
                onLongPress={handleVideoLongPress}
                delayLongPress={800}
>>>>>>> c99daa6 (Initial commit - Clean project state)
              >
                <Ionicons name="expand" size={20} color="#fff" />
              </TouchableOpacity>
              {/* 视频信息 */}
              {post.videoMetadata && (
                <View style={styles.videoMetadata}>
                  <Text style={styles.videoMetadataText}>
                    时长: {Math.floor(post.videoMetadata.durationSeconds / 60)}:{String(post.videoMetadata.durationSeconds % 60).padStart(2, '0')}
                  </Text>
                  <Text style={styles.videoMetadataText}>
                    大小: {(post.videoMetadata.sizeBytes / (1024 * 1024)).toFixed(1)}MB
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.videoPlayer, styles.errorContainer]}>
              <Ionicons name="warning-outline" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>视频数据无效</Text>
              <Text style={styles.errorSubText}>
<<<<<<< HEAD
                {!post.videoUrl && !post.videoCoverUrl ? '缺少视频URL和封面' : 
                 !post.videoUrl ? '缺少视频URL' : '视频URL格式错误'}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  Alert.alert('调试信息', 
=======
                {!post.videoUrl && !post.videoCoverUrl ? '缺少视频URL和封面' :
                 !post.videoUrl ? '缺少视频URL' : '视频URL格式错误'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  Alert.alert('调试信息',
>>>>>>> c99daa6 (Initial commit - Clean project state)
                    `videoUrl: ${post.videoUrl || '无'}\nvideoCoverUrl: ${post.videoCoverUrl || '无'}\nmediaType: ${post.mediaType}`
                  );
                }}
              >
                <Text style={styles.retryText}>查看详情</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}
<<<<<<< HEAD
      
      {/* 图片内容 - 对于IMAGE类型、MIXED类型或者未定义类型但有图片的情况都显示 */}
      {((post.mediaType === 'IMAGE' || post.mediaType === 'MIXED' || (!post.mediaType && post.images && post.images.length > 0)) && post.images && post.images.length > 0) && (
=======

      {/* 图片内容 - 对于IMAGE类型或者未定义类型但有图片的情况都显示 */}
      {((post.mediaType === 'IMAGE' || (!post.mediaType && post.images && post.images.length > 0)) && post.images && post.images.length > 0) && (
>>>>>>> c99daa6 (Initial commit - Clean project state)
        <FlatList
          horizontal
          data={post.images || []}
          keyExtractor={(_, idx) => String(idx)}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <FastImage
              source={{ uri: item }}
              style={[
                styles.image,
                {
                  height:
                    (imageDimensions[index]?.height /
                      imageDimensions[index]?.width) *
                    width,
                },
              ]}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        />
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>
          {post.content || '暂无内容'}
<<<<<<< HEAD
        </Text> 
      </View>

      {/* 全屏视频播放器 */}
      {isVideoFullscreen && (post.mediaType === 'VIDEO' || post.mediaType === 'MIXED') && videoDataValid && post.videoUrl && (
        <VideoPlayer
          source={post.videoUrl}
          poster={post.videoCoverUrl}
          fullscreen={true}
          autoPlay={true}
          defaultMuted={false}
          onExitFullscreen={handleExitFullscreen}
          onError={(error) => {
            console.error('[PostContent] Fullscreen video error:', error);
            Alert.alert('播放错误', '全屏视频播放失败');
            handleExitFullscreen();
          }}
        />
      )}
    </>
  );
};
=======
        </Text>
      </View>
    </>
  );
};

>>>>>>> c99daa6 (Initial commit - Clean project state)
