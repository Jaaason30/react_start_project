// src/utils/videoUtils.ts

// Platform import removed as it's not used

/**
 * 从视频提取第一帧作为封面（简化版本）
 * 使用视频URI本身，让服务器端处理缩略图生成
 * @param videoUri 视频文件URI
 * @returns Promise<any> 封面图片对象
 */
export const extractVideoThumbnail = async (videoUri: string): Promise<any> => {
  try {
    console.log('开始处理视频缩略图, URI:', videoUri);
    
    // 简化实现：使用视频URI本身，让后端或组件处理缩略图
    return {
      uri: videoUri,
      name: 'video_thumbnail.jpg',
      type: 'image/jpeg',
      isVideoCover: true,
      originalVideoUri: videoUri,
    };
  } catch (error) {
    console.warn('提取视频缩略图失败，使用默认封面:', error);
    return generateDefaultThumbnail();
  }
};

/**
 * 生成默认的视频封面
 */
const generateDefaultThumbnail = (): any => {
  // 创建一个简单的默认封面
  const defaultThumbnailBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  return {
    uri: defaultThumbnailBase64,
    name: 'default_video_thumbnail.png',
    type: 'image/png',
  };
};

/**
 * 简化的视频第一帧提取函数
 * 使用react-native-video的onSnapshot功能或创建视频预览
 */
export const getVideoThumbnailSimple = async (videoUri: string): Promise<any> => {
  try {
    // 对于简化实现，我们创建一个基于视频URI的缩略图
    // 在实际应用中，这应该通过服务器端处理或使用原生模块
    
    console.log('开始处理视频缩略图, URI:', videoUri);
    
    // 方法1: 使用视频的元数据创建一个封面
    // 这里我们暂时使用一个基于时间戳的唯一标识符
    const timestamp = Date.now();
    const videoId = videoUri.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'video';
    
    // 创建一个包含视频信息的封面对象
    const thumbnailData = {
      uri: videoUri, // 使用视频本身的URI，让Video组件来处理预览
      name: `${videoId}_cover_${timestamp}.jpg`,
      type: 'image/jpeg',
      isVideoCover: true, // 标记这是视频封面
      originalVideoUri: videoUri,
    };
    
    console.log('视频缩略图数据创建成功:', thumbnailData);
    return thumbnailData;
    
  } catch (error) {
    console.warn('获取视频缩略图失败，使用默认封面:', error);
    return generateDefaultThumbnail();
  }
};

/**
 * 使用canvas从视频提取第一帧 (Web环境)
 * 在React Native中可以用react-native-video的截图功能替代
 */
export const extractVideoFrame = async (videoUri: string, timeInSeconds: number = 1): Promise<any> => {
  return new Promise((resolve) => {
    try {
      // 这个函数在React Native环境中需要使用原生模块或服务器端处理
      // 暂时返回默认封面
      console.log(`尝试从视频 ${videoUri} 的第 ${timeInSeconds} 秒提取帧`);
      
      // 模拟异步处理
      setTimeout(() => {
        resolve({
          uri: videoUri, // 临时使用视频URI
          name: 'extracted_frame.jpg',
          type: 'image/jpeg',
          extractedAt: timeInSeconds,
        });
      }, 500);
      
    } catch (error) {
      console.warn('提取视频帧失败:', error);
      resolve(generateDefaultThumbnail());
    }
  });
};

/**
 * 检查文件是否为视频格式
 */
export const isVideoFile = (fileName: string, mimeType?: string): boolean => {
  if (mimeType) {
    return mimeType.startsWith('video/');
  }
  
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm'];
  const extension = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
  
  return extension ? videoExtensions.includes(extension) : false;
};

/**
 * 格式化视频时长
 */
export const formatVideoDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 获取视频文件大小的可读格式
 */
export const formatVideoSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};