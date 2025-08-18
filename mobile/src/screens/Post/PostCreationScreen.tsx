import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StatusBar, ScrollView, TouchableOpacity,
  TextInput, Image, Dimensions, StyleSheet, Platform, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import VideoPlayerFallback from '../../components/VideoPlayerFallback';
import type { MediaType } from './types';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { apiClient } from '../../services/apiClient';
<<<<<<< HEAD
import { API_ENDPOINTS } from '../../constants/api';
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)
import { patchProfileUrl } from '../Post/utils/urlHelpers';
import { isVideoFile, getVideoThumbnailSimple } from '../../utils/videoUtils';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

// 生成占位图的函数
const generatePlaceholderCover = async (): Promise<any> => {
  // 创建一个简单的占位图数据
  // 这里使用一个简单的base64编码的1x1像素透明图片作为占位符
  const placeholderBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  return {
    uri: placeholderBase64,
    name: 'video_cover_placeholder.png',
    type: 'image/png',
  };
};

<<<<<<< HEAD
const { width } = Dimensions.get('window');
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)
const TH_SIZE = 80;
const GAP = 8;

const mockTags = ['台球技巧', 'Snooker', '英式台球', '斯诺克教学'];

const PostCreationScreen: React.FC = () => {
type PostCreationNav = NativeStackNavigationProp<RootStackParamList, 'PostCreation'>;
const nav = useNavigation<PostCreationNav>();
  const route = useRoute();
  const { profileData, avatarVersion } = useUserProfile();
  const [imgs, setImgs] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [videoCover, setVideoCover] = useState<any>(null);
  const [mediaType, setMediaType] = useState<MediaType>('IMAGE');
<<<<<<< HEAD
  const [hasMixedMedia, setHasMixedMedia] = useState(false);
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selTags, setSelTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // 接收从 DiscoverScreen 传递过来的图片
  useEffect(() => {
    const params = route.params as any;
    if (params?.images && Array.isArray(params.images)) {
      // 将传入的图片 URI 转换为 launchImageLibrary 格式
      const formattedImages = params.images.map((uri: string, index: number) => ({
        uri,
        fileName: `image_${index}.jpg`,
        type: 'image/jpeg',
      }));
      setImgs(formattedImages);
    }
  }, [route.params]);

  const toggleTag = (t: string) =>
    setSelTags(selTags.includes(t) ? selTags.filter(x => x !== t) : [...selTags, t]);

  // 统一的媒体选择函数 - 支持混合选择
<<<<<<< HEAD
  const selectMedia = async () => {
    const result = await launchImageLibrary({ 
      mediaType: 'mixed', // 支持图片和视频混合选择
      selectionLimit: 9, // 最多选择9个文件
=======
  // 统一的媒体选择功能，支持自动类型检测
  const selectMedia = async () => {
    // 如果已有视频，不允许继续选择
    if (video) {
      Alert.alert('提示', '视频帖子只能包含一个视频文件，请先删除现有视频或重置后重新选择');
      return;
    }

    // 根据当前状态决定选择限制
    let mediaTypeOption: 'photo' | 'video' | 'mixed' = 'mixed';
    let selectionLimit = 9;

    if (imgs.length > 0) {
      // 已有图片，只能继续选择图片
      mediaTypeOption = 'photo';
      selectionLimit = 9 - imgs.length;
    }

    const result = await launchImageLibrary({ 
      mediaType: mediaTypeOption,
      selectionLimit: selectionLimit,
>>>>>>> c99daa6 (Initial commit - Clean project state)
      quality: 0.8,
      videoQuality: 'medium',
      includeBase64: false,
      includeExtra: true
    });

    if (result.assets && result.assets.length > 0) {
      await processSelectedMedia(result.assets);
    }
  };

  // 处理选择的媒体文件
  const processSelectedMedia = async (assets: any[]) => {
    const images: any[] = [];
    let selectedVideo: any = null;
<<<<<<< HEAD
    let selectedVideoCover: any = null;
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)

    // 分离图片和视频
    for (const asset of assets) {
      const isVideo = asset.type?.startsWith('video/') || 
                     isVideoFile(asset.fileName || '', asset.type);
      
      if (isVideo) {
        if (selectedVideo) {
          Alert.alert('提示', '只能选择一个视频文件，已自动选择第一个视频');
          break;
        }
        selectedVideo = asset;
<<<<<<< HEAD
        
        // 自动提取视频第一帧作为封面
        try {
          console.log('开始提取视频封面...');
          const thumbnail = await getVideoThumbnailSimple(asset.uri);
          selectedVideoCover = thumbnail;
          console.log('视频封面提取成功:', thumbnail);
        } catch (error) {
          console.warn('提取视频封面失败，使用默认封面:', error);
          selectedVideoCover = await generatePlaceholderCover();
        }
      } else {
        // 图片文件
=======
      } else {
>>>>>>> c99daa6 (Initial commit - Clean project state)
        images.push(asset);
      }
    }

<<<<<<< HEAD
    // 根据选择的媒体类型设置状态
    if (selectedVideo && images.length > 0) {
      // 选择了视频和图片 - 支持混合媒体
      Alert.alert(
        '混合媒体',
        '检测到您同时选择了视频和图片。现在支持混合媒体发布！',
        [
          {
            text: '发布混合媒体（实验性）',
            onPress: () => {
              setVideo(selectedVideo);
              setVideoCover(selectedVideoCover);
              setImgs(images.slice(0, 8)); // 视频+最多8张图片
              setMediaType('MIXED');
              setHasMixedMedia(true);
              
              Alert.alert(
                '混合媒体设置成功', 
                `视频: ${selectedVideo.fileName || '未知'}\n图片: ${images.length}张\n\n⚠️ 注意：目前混合媒体功能为实验性，图片信息将显示在帖子描述中。`
              );
            }
          },
          {
            text: '仅使用视频',
            onPress: () => {
              setVideo(selectedVideo);
              setVideoCover(selectedVideoCover);
              setMediaType('VIDEO');
              setImgs([]);
              setHasMixedMedia(false);
            }
          },
          {
            text: '仅使用图片',
            onPress: () => {
              setImgs(images.slice(0, 9)); // 最多9张图片
              setVideo(null);
              setVideoCover(null);
              setMediaType('IMAGE');
              setHasMixedMedia(false);
=======
    // 根据选择结果设置状态
    if (selectedVideo && images.length > 0) {
      // 同时选择了视频和图片，让用户选择一种类型
      Alert.alert(
        '请选择媒体类型',
        '检测到您同时选择了视频和图片，请选择一种类型：',
        [
          {
            text: '只使用视频',
            onPress: () => {
              handleVideoSelection(selectedVideo);
            }
          },
          {
            text: '只使用图片',
            onPress: () => {
              setImgs([...imgs, ...images.slice(0, 9 - imgs.length)]);
              setMediaType('IMAGE');
>>>>>>> c99daa6 (Initial commit - Clean project state)
            }
          },
          {
            text: '取消',
            style: 'cancel'
          }
        ]
      );
    } else if (selectedVideo) {
      // 只选择了视频
<<<<<<< HEAD
      setVideo(selectedVideo);
      setVideoCover(selectedVideoCover);
      setMediaType('VIDEO');
      setImgs([]);
      setHasMixedMedia(false);
      
      Alert.alert(
        '视频选择成功', 
        `已自动提取视频封面\n视频文件: ${selectedVideo.fileName || '未知'}\n文件大小: ${((selectedVideo.fileSize || 0) / (1024 * 1024)).toFixed(1)}MB`
      );
    } else if (images.length > 0) {
      // 只选择了图片
      setImgs(images.slice(0, 9)); // 最多9张图片
      setVideo(null);
      setVideoCover(null);
      setMediaType('IMAGE');
      setHasMixedMedia(false);
    } else {
      Alert.alert('提示', '未选择任何有效的媒体文件');
    }
  };

  // 保留原来的单独添加图片功能（用于兼容）
  const addImg = async () => {
    const result = await launchImageLibrary({ 
      mediaType: 'photo', 
      selectionLimit: 9 - imgs.length,
      quality: 0.8
    });
    if (result.assets) {
      setImgs([...imgs, ...result.assets]);
    }
  };

  const selectMediaType = (type: MediaType) => {
    setMediaType(type);
    if (type === 'IMAGE') {
      setVideo(null);
      setVideoCover(null);
      setHasMixedMedia(false);
    } else if (type === 'VIDEO') {
      setImgs([]);
      setHasMixedMedia(false);
    } else if (type === 'MIXED') {
      setHasMixedMedia(true);
    }
  };
=======
      handleVideoSelection(selectedVideo);
    } else if (images.length > 0) {
      // 只选择了图片
      setImgs([...imgs, ...images.slice(0, 9 - imgs.length)]);
      setMediaType('IMAGE');
    }
  };

  // 处理视频选择
  const handleVideoSelection = async (asset: any) => {
    setVideo(asset);
    setMediaType('VIDEO');
    setImgs([]); // 清空图片
    
    // 自动提取视频第一帧作为封面
    try {
      console.log('开始提取视频封面...');
      const thumbnail = await getVideoThumbnailSimple(asset.uri);
      setVideoCover(thumbnail);
      console.log('视频封面提取成功:', thumbnail);
    } catch (error) {
      console.warn('提取视频封面失败，使用默认封面:', error);
      const placeholder = await generatePlaceholderCover();
      setVideoCover(placeholder);
    }
  };



>>>>>>> c99daa6 (Initial commit - Clean project state)

  const removeVideo = () => {
    setVideo(null);
    setVideoCover(null);
<<<<<<< HEAD
    if (hasMixedMedia && imgs.length > 0) {
      setMediaType('IMAGE');
      setHasMixedMedia(false);
    } else {
      setMediaType('IMAGE');
      setHasMixedMedia(false);
    }
  };

=======
    // 如果没有图片，重置为未选择状态
    if (imgs.length === 0) {
      setMediaType('IMAGE'); // 默认状态
    } else {
      setMediaType('IMAGE'); // 有图片则设为图片模式
    }
  };

  // 重置所有媒体选择
  const resetMedia = () => {
    Alert.alert(
      '重置媒体',
      '确定要清空所有已选择的媒体吗？',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: () => {
            setImgs([]);
            setVideo(null);
            setVideoCover(null);
            setMediaType('IMAGE');
          }
        }
      ]
    );
  };

>>>>>>> c99daa6 (Initial commit - Clean project state)
  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('提示', '请填写标题和正文');
      return;
    }

    if (mediaType === 'IMAGE' && imgs.length === 0) {
      Alert.alert('提示', '请选择至少一张图片');
      return;
    }

    if (mediaType === 'VIDEO' && !video) {
      Alert.alert('提示', '请选择一个视频');
      return;
    }

<<<<<<< HEAD
    if (mediaType === 'MIXED' && (!video || imgs.length === 0)) {
      Alert.alert('提示', '混合媒体模式需要至少一个视频和一张图片');
      return;
    }
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)

    setIsPosting(true);

    try {
      let response;
      
      if (mediaType === 'VIDEO') {
        // 确保视频上传总是包含封面图，如果没有用户选择的封面，使用占位图
        const finalVideoCover = videoCover || await generatePlaceholderCover();
        
        // 使用视频上传方法
        response = await apiClient.uploadVideo('/api/posts', {
          title: title.trim(),
          content: content.trim(),
          video: {
            uri: video.uri,
            name: video.fileName || 'video.mp4',
            type: video.type || 'video/mp4',
          },
          videoCover: {
            uri: finalVideoCover.uri,
            name: finalVideoCover.name || 'video_cover.jpg',
            type: finalVideoCover.type || 'image/jpeg',
          },
          onProgress: (progress) => {
            console.log('Upload progress:', progress + '%');
          },
        });
<<<<<<< HEAD
      } else if (mediaType === 'MIXED') {
        // 混合媒体上传 - 暂时使用VIDEO类型，后端可能不支持MIXED
        const finalVideoCover = videoCover || await generatePlaceholderCover();
        
        // 先上传视频，然后在content中说明还有额外图片
        const imageInfo = imgs.length > 0 ? `\n\n📷 此帖包含 ${imgs.length} 张额外图片` : '';
        
        // 使用视频上传方法
        response = await apiClient.uploadVideo('/api/posts', {
          title: title.trim(),
          content: content.trim() + imageInfo,
          video: {
            uri: video.uri,
            name: video.fileName || 'video.mp4',
            type: video.type || 'video/mp4',
          },
          videoCover: {
            uri: finalVideoCover.uri,
            name: finalVideoCover.name || 'video_cover.jpg',
            type: finalVideoCover.type || 'image/jpeg',
          },
          onProgress: (progress) => {
            console.log('Mixed media upload progress:', progress + '%');
          },
        });
        
        // TODO: 如果后端支持，可以在这里额外上传图片
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)
      } else {
        // 使用图片上传方法
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('mediaType', 'IMAGE');
        selTags.forEach(tag => formData.append('tagNames', tag));
        imgs.forEach((img, i) => {
          formData.append('images', {
            uri: img.uri,
            name: img.fileName || `image${i}.jpg`,
            type: img.type || 'image/jpeg',
          } as any);
        });
        response = await apiClient.upload('/api/posts', formData);
      }

      if (response.error) {
        console.error('[❌ 发布失败]', response.error);
        Alert.alert('发布失败', response.error);
      } else {
        console.log('[✅ 发布成功]', response.data);
        
<<<<<<< HEAD
        // 构造新帖子对象 - MIXED类型暂时作为VIDEO处理
        const finalMediaType = mediaType === 'MIXED' ? 'VIDEO' : mediaType;
=======
        // 构造新帖子对象
>>>>>>> c99daa6 (Initial commit - Clean project state)
        const newPost = {
          uuid: response.data.uuid || `temp-${Date.now()}`,
          title: title.trim(),
          content: content.trim(),
<<<<<<< HEAD
          mediaType: finalMediaType,
          images: mediaType === 'IMAGE' ? imgs.map(img => img.uri) : [],
          videoUrl: (mediaType === 'VIDEO' || mediaType === 'MIXED') ? response.data.videoUrl : undefined,
          videoCoverUrl: (mediaType === 'VIDEO' || mediaType === 'MIXED') ? response.data.videoCoverUrl : undefined,
          videoMetadata: (mediaType === 'VIDEO' || mediaType === 'MIXED') ? response.data.videoMetadata : undefined,
=======
          mediaType: mediaType,
          images: mediaType === 'IMAGE' ? imgs.map(img => img.uri) : [],
          videoUrl: mediaType === 'VIDEO' ? response.data.videoUrl : undefined,
          videoCoverUrl: mediaType === 'VIDEO' ? response.data.videoCoverUrl : undefined,
          videoMetadata: mediaType === 'VIDEO' ? response.data.videoMetadata : undefined,
>>>>>>> c99daa6 (Initial commit - Clean project state)
          author: {
            shortId: profileData?.shortId,
            nickname: profileData?.nickname || '未知用户',
            profilePictureUrl: patchProfileUrl(profileData?.profilePictureUrl || '', avatarVersion),
          },
          likeCount: 0,
          collectCount: 0,
          commentCount: 0,
          likedByCurrentUser: false,
          collectedByCurrentUser: false,
          followedByCurrentUser: false,
        };

                
        // 调用回调函数更新列表
        const params = route.params as any;
        if (params?.onPostSuccess) {
          params.onPostSuccess(newPost);
        }
        
        // 直接返回广场，不显示 Alert
        nav.navigate('Discover');
      }
    } catch (error) {
      console.error('[❌ 网络错误]', error);
      Alert.alert('网络错误', '无法连接服务器，请检查网络连接');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.top}>
        <TouchableOpacity onPress={() => nav.goBack()} disabled={isPosting}>
          <Ionicons name="chevron-back" size={28} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
<<<<<<< HEAD
        {/* 媒体类型选择 */}
        <View style={styles.mediaTypeSelector}>
          <TouchableOpacity
            style={[styles.mediaTypeBtn, mediaType === 'IMAGE' && styles.mediaTypeBtnActive]}
            onPress={() => selectMediaType('IMAGE')}
            disabled={isPosting}
          >
            <Ionicons name="images-outline" size={18} color={mediaType === 'IMAGE' ? '#f33' : '#666'} />
            <Text style={[styles.mediaTypeTxt, mediaType === 'IMAGE' && styles.mediaTypeTxtActive]}>图片</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mediaTypeBtn, mediaType === 'VIDEO' && styles.mediaTypeBtnActive]}
            onPress={() => selectMediaType('VIDEO')}
            disabled={isPosting}
          >
            <Ionicons name="videocam-outline" size={18} color={mediaType === 'VIDEO' ? '#f33' : '#666'} />
            <Text style={[styles.mediaTypeTxt, mediaType === 'VIDEO' && styles.mediaTypeTxtActive]}>视频</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mediaTypeBtn, mediaType === 'MIXED' && styles.mediaTypeBtnActive]}
            onPress={() => selectMediaType('MIXED')}
            disabled={isPosting}
          >
            <Ionicons name="library-outline" size={18} color={mediaType === 'MIXED' ? '#f33' : '#666'} />
            <Text style={[styles.mediaTypeTxt, mediaType === 'MIXED' && styles.mediaTypeTxtActive]}>混合</Text>
          </TouchableOpacity>
        </View>

        {/* 视频选择和预览 */}
        {(mediaType === 'VIDEO' || mediaType === 'MIXED') && (
          <View style={styles.videoSection}>
            {video ? (
              <View style={styles.videoPreview}>
                <VideoPlayerFallback
                  source={video.uri}
                  style={styles.videoPlayer}
                  onPress={() => {
                    Alert.alert('视频预览', '视频功能正在开发中，目前显示预览图');
                  }}
                />
                <TouchableOpacity
                  style={styles.removeVideoBtn}
                  onPress={removeVideo}
                  disabled={isPosting}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoInfoText}>时长: {Math.floor((video.duration || 0) / 60)}:{String(Math.floor((video.duration || 0) % 60)).padStart(2, '0')}</Text>
                  <Text style={styles.videoInfoText}>大小: {((video.fileSize || 0) / (1024 * 1024)).toFixed(1)}MB</Text>
                </View>
              </View>
            ) : (
              <View style={styles.videoSelectorContainer}>
                <TouchableOpacity
                  style={[styles.videoSelector, isPosting && styles.disabled]}
                  onPress={selectMedia}
                  disabled={isPosting}
                >
                  <Ionicons name="videocam" size={48} color="#aaa" />
                  <Text style={styles.videoSelectorText}>
                    {mediaType === 'MIXED' ? '选择视频和图片（实验性）' : '从相册选择媒体'}
                  </Text>
                  <Text style={styles.videoSelectorHint}>
                    {mediaType === 'MIXED' 
                      ? '实验性功能：1个视频+多张图片，图片信息将在描述中显示' 
                      : '支持图片和视频混合选择，视频自动提取封面'
                    }
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.videoSelectorInfo}>
                  <Text style={styles.videoSelectorInfoText}>
                    💡 提示：点击按钮可同时选择图片和视频，系统会自动处理媒体类型。
                  </Text>
                  <Text style={styles.videoSelectorInfoText}>
                    📷 选择视频时会自动提取第一帧作为封面图。
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 图片选择 */}
        {(mediaType === 'IMAGE' || mediaType === 'MIXED') && (
        <ScrollView horizontal style={styles.imgRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {imgs.map((img, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.thumb} />
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => setImgs(imgs.filter((_, idx) => idx !== i))}
                disabled={isPosting}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {((mediaType === 'IMAGE' && imgs.length < 9) || (mediaType === 'MIXED' && imgs.length < 8)) && (
            <TouchableOpacity 
              style={[styles.addThumb, isPosting && styles.disabled]} 
              onPress={selectMedia}
              disabled={isPosting}
            >
              <Ionicons name="add" size={36} color="#aaa" />
              <Text style={styles.addTxt}>
                {mediaType === 'MIXED' ? `${imgs.length}/8` : `${imgs.length}/9`}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        )}
=======

        {/* 统一的媒体选择区域 */}
        <View style={styles.mediaSection}>
          {/* 当前模式显示 */}
          {(imgs.length > 0 || video) && (
            <View style={styles.currentModeIndicator}>
              <View style={styles.modeIndicatorContent}>
                <Ionicons 
                  name={mediaType === 'VIDEO' ? 'videocam' : 'images'} 
                  size={16} 
                  color="#f33" 
                />
                <Text style={styles.modeIndicatorText}>
                  {mediaType === 'VIDEO' ? '视频模式' : '图片模式'}
                </Text>
                <TouchableOpacity 
                  style={styles.resetBtn} 
                  onPress={resetMedia}
                  disabled={isPosting}
                >
                  <Ionicons name="refresh" size={14} color="#666" />
                  <Text style={styles.resetBtnText}>重置</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 视频预览 */}
          {video && (
            <View style={styles.videoPreview}>
              <VideoPlayerFallback
                source={video.uri}
                style={styles.videoPlayer}
                onPress={() => {
                  Alert.alert('视频预览', '视频功能正在开发中，目前显示预览图');
                }}
              />
              <TouchableOpacity
                style={styles.removeVideoBtn}
                onPress={removeVideo}
                disabled={isPosting}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.videoInfo}>
                <Text style={styles.videoInfoText}>时长: {Math.floor((video.duration || 0) / 60)}:{String(Math.floor((video.duration || 0) % 60)).padStart(2, '0')}</Text>
                <Text style={styles.videoInfoText}>大小: {((video.fileSize || 0) / (1024 * 1024)).toFixed(1)}MB</Text>
              </View>
            </View>
          )}

          {/* 图片预览 */}
          {imgs.length > 0 && (
            <ScrollView horizontal style={styles.imgRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {imgs.map((img, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => setImgs(imgs.filter((_, idx) => idx !== i))}
                    disabled={isPosting}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* 统一的媒体选择按钮 */}
          {(!video && imgs.length < 9) && (
            <View style={styles.mediaSelector}>
              <TouchableOpacity
                style={[styles.mediaSelectorBtn, isPosting && styles.disabled]}
                onPress={selectMedia}
                disabled={isPosting}
              >
                <Ionicons name="add-circle" size={48} color="#f33" />
                <Text style={styles.mediaSelectorText}>
                  {imgs.length > 0 ? '继续添加图片' : '选择媒体'}
                </Text>
                <Text style={styles.mediaSelectorHint}>
                  {imgs.length > 0 
                    ? `已有${imgs.length}张图片，还可添加${9 - imgs.length}张`
                    : '支持选择图片或视频，系统会自动检测类型'
                  }
                </Text>
              </TouchableOpacity>
              
              {imgs.length === 0 && (
                <View style={styles.mediaSelectorInfo}>
                  <Text style={styles.mediaSelectorInfoText}>
                    📷 图片：最多9张，支持JPG/PNG格式
                  </Text>
                  <Text style={styles.mediaSelectorInfoText}>
                    🎥 视频：仅支持1个，系统自动提取封面
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
>>>>>>> c99daa6 (Initial commit - Clean project state)

        <View style={styles.form}>
          <TextInput
            placeholder="添加标题"
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            editable={!isPosting}
          />
          <TextInput
            placeholder="添加正文"
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={!isPosting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.secTitle}>标签</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockTags.map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip, 
                  selTags.includes(t) && styles.chipActive,
                  isPosting && styles.disabled
                ]}
                onPress={() => toggleTag(t)}
                disabled={isPosting}
              >
                <Text style={[styles.chipTxt, selTags.includes(t) && styles.chipTxtActive]}>
                  #{t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity 
          style={[styles.pubBtn, isPosting && styles.pubBtnDisabled]} 
          onPress={handlePost}
          disabled={isPosting}
        >
          <Text style={styles.pubTxt}>{isPosting ? '发布中...' : '发帖'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostCreationScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  top: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 8,
    height: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 8) + 44,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee',
    backgroundColor: '#fff',
  },
  imgRow: { marginTop: 16 },
  thumbWrap: { position: 'relative', marginRight: GAP },
  thumb: { width: TH_SIZE, height: TH_SIZE, borderRadius: 8 },
  delBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
  addThumb: {
    width: TH_SIZE, height: TH_SIZE, borderRadius: 8, borderWidth: 1,
    borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#fafafa'
  },
  addTxt: { fontSize: 11, color: '#888', marginTop: 2 },
  form: { paddingHorizontal: 16, marginTop: 20 },
  titleInput: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  contentInput: { fontSize: 16, color: '#333', height: 120, lineHeight: 24 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  secTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f5f5f5', marginRight: 8 },
  chipActive: { backgroundColor: '#ffecec' },
  chipTxt: { fontSize: 14, color: '#666' },
  chipTxtActive: { color: '#f44' },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, height: 64, borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee', backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  }, 
  pubBtn: { backgroundColor: '#f33', borderRadius: 24, paddingHorizontal: 26, paddingVertical: 10 },
  pubBtnDisabled: { backgroundColor: '#ffb3b3' },
  pubTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
<<<<<<< HEAD
  // 视频相关样式
  mediaTypeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 4,
  },
  mediaTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  mediaTypeBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mediaTypeTxt: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  mediaTypeTxtActive: {
    color: '#f33',
    fontWeight: '600',
  },
  videoSection: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  videoSelector: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
=======
  // 统一媒体选择样式
  mediaSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  currentModeIndicator: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f33',
  },
  modeIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIndicatorText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetBtnText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  mediaSelector: {
    marginTop: 8,
  },
  mediaSelectorBtn: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f33',
>>>>>>> c99daa6 (Initial commit - Clean project state)
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
<<<<<<< HEAD
  videoSelectorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  videoSelectorHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  videoSelectorContainer: {
    marginTop: 8,
  },
  videoSelectorInfo: {
=======
  mediaSelectorText: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
    fontWeight: '600',
  },
  mediaSelectorHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  mediaSelectorInfo: {
>>>>>>> c99daa6 (Initial commit - Clean project state)
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
<<<<<<< HEAD
  videoSelectorInfoText: {
=======
  mediaSelectorInfoText: {
>>>>>>> c99daa6 (Initial commit - Clean project state)
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
  },
  videoPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPlayer: {
    height: 200,
    borderRadius: 12,
  },
  removeVideoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  videoInfoText: {
    color: '#fff',
    fontSize: 12,
  },
});