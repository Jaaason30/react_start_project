// src/components/VideoPlayer.tsx

import React, { useRef, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableWithoutFeedback,
<<<<<<< HEAD
=======
  StatusBar,
  Modal,
>>>>>>> c99daa6 (Initial commit - Clean project state)
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useVideoPlayer, formatTime } from '../hooks/useVideoPlayer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface VideoPlayerProps {
  /** 视频源URL */
  source: string;
  /** 视频封面URL */
  poster?: string;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 是否默认静音 */
  defaultMuted?: boolean;
  /** 是否全屏模式 */
  fullscreen?: boolean;
  /** 是否持久显示控制栏 */
  persistentControls?: boolean;
  /** 视频容器样式 */
  style?: any;
  /** 错误回调 */
  onError?: (error: any) => void;
  /** 加载完成回调 */
  onLoad?: (data: any) => void;
  /** 播放结束回调 */
  onEnd?: () => void;
  /** 点击视频回调 */
  onPress?: () => void;
  /** 退出全屏回调 */
  onExitFullscreen?: () => void;
}

const VideoPlayerComponent: React.FC<VideoPlayerProps> = ({
  source,
  poster,
  autoPlay = true,
  defaultMuted = true,
  fullscreen = false,
  persistentControls = false,
  style,
  onError,
  onLoad,
  onEnd,
  onPress,
  onExitFullscreen,
}) => {
  const videoRef = useRef<VideoRef>(null);
  const [playerState, playerActions] = useVideoPlayer({
    autoPlay,
    defaultMuted,
    pauseOnBackground: true,
    controlsTimeout: 3000,
    persistentControls: persistentControls || fullscreen, // 全屏或明确指定时使用持久控制
  });

  // 全屏模式下自动显示控制栏
  useEffect(() => {
    if (fullscreen) {
<<<<<<< HEAD
=======
      console.log('[VideoPlayer] Entering fullscreen mode');
>>>>>>> c99daa6 (Initial commit - Clean project state)
      // 延迟一点显示控制栏，确保组件已经渲染
      const timer = setTimeout(() => {
        playerActions.showControlsTemporarily();
      }, 100);
      return () => clearTimeout(timer);
<<<<<<< HEAD
=======
    } else {
      console.log('[VideoPlayer] Exiting fullscreen mode');
>>>>>>> c99daa6 (Initial commit - Clean project state)
    }
  }, [fullscreen, playerActions]);

  // URL validation
  const isValidVideoUrl = (url: string): boolean => {
    if (!url || url.trim() === '') {
      return false;
    }
    try {
      // Check if it's a valid URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
<<<<<<< HEAD
        new URL(url);
        return true;
=======
        const validUrl = new URL(url);
        return !!validUrl;
>>>>>>> c99daa6 (Initial commit - Clean project state)
      }
      // Check for relative paths
      if (url.startsWith('/')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const validSource = isValidVideoUrl(source);

  // 样式
<<<<<<< HEAD
  const containerStyle = fullscreen 
    ? styles.fullscreenContainer 
=======
  // 全屏时隐藏状态栏
  useEffect(() => {
    if (fullscreen) {
      StatusBar.setHidden(true, 'fade');
    } else {
      StatusBar.setHidden(false, 'fade');
    }

    // 清理函数：组件卸载时恢复状态栏
    return () => {
      if (fullscreen) {
        StatusBar.setHidden(false, 'fade');
      }
    };
  }, [fullscreen]);

  const containerStyle = fullscreen
    ? styles.fullscreenContainer
>>>>>>> c99daa6 (Initial commit - Clean project state)
    : [styles.container, style];

  // If source is invalid, show error immediately
  if (!validSource) {
    return (
      <View style={containerStyle}>
        <View style={styles.errorOverlay}>
          <Icon name="warning-outline" size={48} color="#fff" />
          <Text style={styles.errorText}>无效的视频URL</Text>
          <Text style={styles.errorText}>{source}</Text>
        </View>
      </View>
    );
  }

  // 处理视频加载
  const handleLoad = (data: any) => {
    playerActions.updateProgress(0, data.duration);
    playerActions.setLoading(false);
    onLoad?.(data);
  };

  // 处理视频错误
  const handleError = (error: any) => {
    playerActions.setError('视频加载失败');
    onError?.(error);
  };

  // 处理播放进度
  const handleProgress = (data: any) => {
    playerActions.updateProgress(data.currentTime, playerState.duration);
  };

  // 处理播放结束
  const handleEnd = () => {
    playerActions.pause();
    onEnd?.();
  };

  // 处理缓冲
  const handleBuffer = (data: any) => {
    playerActions.setLoading(data.isBuffering);
  };

  // 处理视频点击
  const handleVideoPress = () => {
    if (onPress) {
      onPress();
    } else {
      // 默认行为：切换播放状态或显示控制栏
      if (playerState.hasError) {
        playerActions.retry();
      } else if (fullscreen) {
        // 全屏模式下直接切换播放状态
        playerActions.togglePlayback();
      } else {
        playerActions.togglePlayback();
      }
    }
  };

  // 处理静音切换
  const handleMuteToggle = () => {
    playerActions.toggleMute();
  };

  // 处理重试
  const handleRetry = () => {
    playerActions.retry();
  };

<<<<<<< HEAD
  const videoStyle = fullscreen 
    ? styles.fullscreenVideo 
    : styles.video;

=======
  const videoStyle = fullscreen
    ? styles.fullscreenVideo
    : styles.video;

  console.log('[VideoPlayer] Rendering with fullscreen:', fullscreen);

  // 如果是全屏模式，使用Modal渲染
  if (fullscreen) {
    return (
      <Modal
        visible={true}
        animationType="fade"
        statusBarTranslucent={true}
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={onExitFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableWithoutFeedback onPress={handleVideoPress}>
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ uri: source }}
                poster={poster}
                paused={!playerState.isPlaying}
                muted={playerState.isMuted}
                resizeMode="contain"
                onLoad={handleLoad}
                onError={handleError}
                onProgress={handleProgress}
                onEnd={handleEnd}
                onBuffer={handleBuffer}
                style={styles.fullscreenVideo}
                repeat={false}
                playWhenInactive={false}
                playInBackground={false}
                ignoreSilentSwitch="ignore"
                controls={false}
                disableFocus={true}
              />

              {/* 加载指示器 */}
              {playerState.isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}

              {/* 错误显示 */}
              {playerState.hasError && (
                <View style={styles.errorOverlay}>
                  <Icon name="warning-outline" size={48} color="#fff" />
                  <Text style={styles.errorText}>
                    {playerState.errorMessage || '视频加载失败'}
                  </Text>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryText}>重试</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 静音指示器 */}
              {!playerState.isMuted && (
                <TouchableOpacity style={styles.soundButton} onPress={handleMuteToggle}>
                  <Icon name="volume-high" size={24} color="#fff" />
                </TouchableOpacity>
              )}

              {/* 返回按钮 */}
              <TouchableOpacity style={styles.backButton} onPress={onExitFullscreen}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              {/* 控制栏 */}
              {playerState.showControls && (
                <View style={styles.controlsOverlay}>
                  <View style={styles.topControls}>
                    <View style={styles.spacer} />
                    <TouchableOpacity style={styles.controlButton} onPress={handleMuteToggle}>
                      <Icon
                        name={playerState.isMuted ? 'volume-mute' : 'volume-high'}
                        size={24}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.centerControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={playerActions.togglePlayback}>
                      <Icon
                        name={playerState.isPlaying ? 'pause' : 'play'}
                        size={48}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bottomControls}>
                    <Text style={styles.timeText}>
                      {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    );
  }

  // 非全屏模式的正常渲染
>>>>>>> c99daa6 (Initial commit - Clean project state)
  return (
    <View style={containerStyle}>
      <TouchableWithoutFeedback onPress={handleVideoPress}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: source }}
            poster={poster}
            paused={!playerState.isPlaying}
            muted={playerState.isMuted}
            resizeMode={fullscreen ? 'contain' : 'cover'}
            onLoad={handleLoad}
            onError={handleError}
            onProgress={handleProgress}
            onEnd={handleEnd}
            onBuffer={handleBuffer}
            style={videoStyle}
            repeat={false}
            playWhenInactive={false}
            playInBackground={false}
            ignoreSilentSwitch="ignore"
<<<<<<< HEAD
=======
            controls={false}
            disableFocus={true}
>>>>>>> c99daa6 (Initial commit - Clean project state)
          />

          {/* 加载指示器 */}
          {playerState.isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {/* 错误显示 */}
          {playerState.hasError && (
            <View style={styles.errorOverlay}>
              <Icon name="warning-outline" size={48} color="#fff" />
              <Text style={styles.errorText}>
                {playerState.errorMessage || '视频加载失败'}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryText}>重试</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 播放控制（非全屏模式） */}
          {!fullscreen && !playerState.isLoading && !playerState.hasError && (
            <View style={styles.playOverlay}>
<<<<<<< HEAD
              <TouchableOpacity 
                style={[
                  styles.playButton,
                  persistentControls && styles.persistentPlayButton
                ]} 
                onPress={playerActions.togglePlayback}
              >
                <Icon 
                  name={playerState.isPlaying ? "pause" : "play"} 
                  size={persistentControls ? 32 : 48} 
                  color="#fff" 
=======
              <TouchableOpacity
                style={[
                  styles.playButton,
                  persistentControls && styles.persistentPlayButton,
                ]}
                onPress={playerActions.togglePlayback}
              >
                <Icon
                  name={playerState.isPlaying ? 'pause' : 'play'}
                  size={persistentControls ? 32 : 48}
                  color="#fff"
>>>>>>> c99daa6 (Initial commit - Clean project state)
                />
              </TouchableOpacity>
            </View>
          )}

<<<<<<< HEAD
          {/* 静音指示器（全屏模式） */}
          {fullscreen && !playerState.isMuted && (
            <TouchableOpacity style={styles.soundButton} onPress={handleMuteToggle}>
              <Icon name="volume-high" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* 全屏控制栏 - 始终显示返回键 */}
          {fullscreen && (
            <>
              {/* 固定返回键 */}
              <TouchableOpacity style={styles.backButton} onPress={onExitFullscreen}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              {/* 可隐藏的控制栏 */}
              {playerState.showControls && (
                <View style={styles.controlsOverlay}>
                  <View style={styles.topControls}>
                    <View style={styles.spacer} />
                    <TouchableOpacity style={styles.controlButton} onPress={handleMuteToggle}>
                      <Icon 
                        name={playerState.isMuted ? 'volume-mute' : 'volume-high'} 
                        size={24} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.centerControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={playerActions.togglePlayback}>
                      <Icon 
                        name={playerState.isPlaying ? 'pause' : 'play'} 
                        size={48} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bottomControls}>
                    <Text style={styles.timeText}>
                      {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
=======
>>>>>>> c99daa6 (Initial commit - Clean project state)
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  fullscreenContainer: {
<<<<<<< HEAD
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
=======
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
>>>>>>> c99daa6 (Initial commit - Clean project state)
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    width: screenWidth,
    height: screenHeight,
<<<<<<< HEAD
=======
    backgroundColor: '#000',
>>>>>>> c99daa6 (Initial commit - Clean project state)
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  persistentPlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  soundButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< HEAD
    zIndex: 1001,
=======
    zIndex: 10000,
    elevation: 1000, // For Android
>>>>>>> c99daa6 (Initial commit - Clean project state)
  },
  spacer: {
    flex: 1,
  },
  centerControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'System',
  },
});

export const VideoPlayer = memo(VideoPlayerComponent);

<<<<<<< HEAD
export default VideoPlayer;
=======
export default VideoPlayer;
>>>>>>> c99daa6 (Initial commit - Clean project state)
