// src/hooks/useVideoPlayer.ts

import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface VideoPlayerState {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否静音 */
  isMuted: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否有错误 */
  hasError: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 视频总时长（秒） */
  duration: number;
  /** 是否显示控制栏 */
  showControls: boolean;
}

export interface VideoPlayerActions {
  /** 播放 */
  play: () => void;
  /** 暂停 */
  pause: () => void;
  /** 切换播放/暂停 */
  togglePlayback: () => void;
  /** 切换静音 */
  toggleMute: () => void;
  /** 重新播放 */
  replay: () => void;
  /** 重试（出错时） */
  retry: () => void;
  /** 跳转到指定时间 */
  seekTo: (time: number) => void;
  /** 显示控制栏 */
  showControlsTemporarily: () => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误状态 */
  setError: (error: string | null) => void;
  /** 更新播放时间 */
  updateProgress: (currentTime: number, duration: number) => void;
}

export interface UseVideoPlayerOptions {
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 是否默认静音 */
  defaultMuted?: boolean;
  /** 是否在应用切换到后台时暂停 */
  pauseOnBackground?: boolean;
  /** 控制栏显示时长（毫秒） */
  controlsTimeout?: number;
  /** 是否持久显示控制栏 */
  persistentControls?: boolean;
}

export const useVideoPlayer = (options: UseVideoPlayerOptions = {}): [VideoPlayerState, VideoPlayerActions] => {
  const {
    autoPlay = true,
    defaultMuted = true,
    pauseOnBackground = true,
    controlsTimeout = 3000,
    persistentControls = false,
  } = options;

  // 状态管理
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: autoPlay,
    isMuted: defaultMuted,
    isLoading: true,
    hasError: false,
    errorMessage: undefined,
    currentTime: 0,
    duration: 0,
    showControls: persistentControls, // 持久控制模式下默认显示控制栏
  });

  // 控制栏定时器
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 记录后台前的播放状态
  const wasPlayingBeforeBackgroundRef = useRef<boolean>(false);

  // 清除控制栏定时器
  const clearControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  };

  // 启动控制栏定时器
  const startControlsTimer = () => {
    if (persistentControls) return; // 持久控制模式下不启动定时器
    
    clearControlsTimer();
    controlsTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, showControls: false }));
    }, controlsTimeout);
  };

  // 处理应用状态变化
  useEffect(() => {
    if (!pauseOnBackground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setState(prev => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          // 切换到后台，记录当前播放状态并暂停
          wasPlayingBeforeBackgroundRef.current = prev.isPlaying;
          return prev.isPlaying ? { ...prev, isPlaying: false } : prev;
        } else if (nextAppState === 'active') {
          // 切换到前台，恢复之前的播放状态
          return wasPlayingBeforeBackgroundRef.current ? { ...prev, isPlaying: true } : prev;
        }
        return prev;
      });
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [pauseOnBackground]);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearControlsTimer();
    };
  }, []);

  // 动作方法
  const actions: VideoPlayerActions = {
    play: () => {
      setState(prev => ({ ...prev, isPlaying: true, hasError: false }));
    },

    pause: () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    },

    togglePlayback: () => {
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying, hasError: false }));
    },

    toggleMute: () => {
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    },

    replay: () => {
      setState(prev => ({
        ...prev,
        isPlaying: true,
        hasError: false,
        currentTime: 0,
      }));
    },

    retry: () => {
      setState(prev => ({
        ...prev,
        hasError: false,
        errorMessage: undefined,
        isLoading: true,
        isPlaying: autoPlay,
      }));
    },

    seekTo: (time: number) => {
      setState(prev => ({
        ...prev,
        currentTime: Math.max(0, Math.min(time, prev.duration)),
      }));
    },

    showControlsTemporarily: () => {
      setState(prev => ({ ...prev, showControls: true }));
      if (!persistentControls) {
        startControlsTimer();
      }
    },

    setLoading: (loading: boolean) => {
      setState(prev => ({ ...prev, isLoading: loading }));
    },

    setError: (error: string | null) => {
      setState(prev => ({
        ...prev,
        hasError: !!error,
        errorMessage: error || undefined,
        isLoading: false,
        isPlaying: false,
      }));
    },

    updateProgress: (currentTime: number, duration: number) => {
      setState(prev => ({
        ...prev,
        currentTime,
        duration,
        isLoading: false,
      }));
    },
  };

  return [state, actions];
};

// 格式化时间显示
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};