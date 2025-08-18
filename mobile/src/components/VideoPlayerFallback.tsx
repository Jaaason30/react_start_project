// src/components/VideoPlayerFallback.tsx
// 临时回退组件，用于当react-native-video无法工作时

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface VideoPlayerFallbackProps {
  /** 视频源URL或封面URL */
  source: string;
  /** 视频封面URL */
  poster?: string;
  /** 视频容器样式 */
  style?: any;
  /** 点击视频回调 */
  onPress?: () => void;
  /** 是否显示调试信息 */
  showDebugInfo?: boolean;
}

export const VideoPlayerFallback: React.FC<VideoPlayerFallbackProps> = ({
  source,
  poster,
  style,
  onPress,
  showDebugInfo = false,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [validUrls, setValidUrls] = useState({ poster: false, source: false });

  // 验证 URL 有效性（放宽验证规则）
  useEffect(() => {
    const validateUrl = (url: string): boolean => {
      if (!url || url.trim() === '') return false;
      
      // 接受 http/https URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return true;
      }
      
      // 接受相对路径（以 / 开头）
      if (url.startsWith('/')) {
        return true;
      }
      
      // 接受 file:// 协议（本地文件）
      if (url.startsWith('file://')) {
        return true;
      }
      
      // 尝试作为完整 URL 解析
      try {
        new URL(url);
        return true;
      } catch {
        // 如果不是完整 URL，可能是相对路径，也接受
        return url.length > 0;
      }
    };

    setValidUrls({
      poster: poster ? validateUrl(poster) : false,
      source: source ? validateUrl(source) : false,
    });

    // 调试日志
    console.log('[VideoPlayerFallback] Debug Info:');
    console.log('- source:', source);
    console.log('- poster:', poster);
    console.log('- validUrls:', { 
      poster: poster ? validateUrl(poster) : false, 
      source: source ? validateUrl(source) : false 
    });
  }, [source, poster]);

  // 优先显示封面图，其次显示视频源，最后显示占位图
  const imageSource = (validUrls.poster && poster) || (validUrls.source && source);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.log('[VideoPlayerFallback] Image failed to load:', imageSource);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (source && validUrls.source) {
      // 默认行为：尝试用外部播放器打开视频
      Linking.canOpenURL(source).then(supported => {
        if (supported) {
          Linking.openURL(source);
        } else {
          console.log('Cannot open video URL:', source);
        }
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.videoWrapper} onPress={handlePress} activeOpacity={0.8}>
        {imageSource ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageSource }} 
              style={styles.video}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoading && !imageError && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            {imageError && (
              <View style={[styles.video, styles.placeholder]}>
                <Icon name="image-outline" size={48} color="#bbb" />
                <Text style={styles.placeholderText}>封面加载失败</Text>
                <Text style={styles.debugText}>{imageSource}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.video, styles.placeholder]}>
            <Icon name="videocam" size={48} color="#bbb" />
            <Text style={styles.placeholderText}>视频预览</Text>
            {showDebugInfo && (
              <Text style={styles.debugText}>
                Source: {source || '无'}
              </Text>
            )}
          </View>
        )}
        
        {/* 播放按钮覆盖层 */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Icon name="play" size={32} color="#fff" />
          </View>
        </View>
        
        {/* 视频标识 */}
        <View style={styles.videoLabel}>
          <Icon name="videocam" size={16} color="#fff" />
          <Text style={styles.videoLabelText}>视频</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  debugText: {
    marginTop: 4,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  videoLabelText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default VideoPlayerFallback;