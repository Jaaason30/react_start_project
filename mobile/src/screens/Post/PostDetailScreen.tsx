import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { styles } from '../../theme/PostDetailScreen.styles';

// Components
import { PostHeader } from './PostDetail/components/PostHeader';
import { PostContent } from './PostDetail/components/PostContent';
import { CommentSection } from './PostDetail/components/CommentSection';
import { CommentItem } from './PostDetail/components/CommentItem';
import { ActionBar } from './PostDetail/components/ActionBar';
import { CommentModal } from './PostDetail/components/CommentModal';
<<<<<<< HEAD
=======
import VideoPlayer from '../../components/VideoPlayer';
>>>>>>> c99daa6 (Initial commit - Clean project state)

// Hooks
import { usePostDetail } from './PostDetail/hooks/usePostDetail';
import { useComments } from './PostDetail/hooks/useComments';
import { usePostActions } from './PostDetail/hooks/usePostActions';
import { useCommentActions } from './PostDetail/hooks/useCommentActions';
import { checkTokenStatus } from '../../services/apiClient';
import type { RootStackParamList } from '../../App';
// Types
import { CommentType } from './types';

console.log('[PostDetailScreen] Token Status →', checkTokenStatus());

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { post: initialPost, onDeleteSuccess } = route.params;
  const { refreshProfile } = useUserProfile();
  console.log('[PostDetailScreen] route params →', initialPost);
  const listRef = useRef<FlatList<CommentType>>(null);
  const [commentY, setCommentY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

  // Custom hooks
  const {
    post,
    setPost,
    loading,
    isLiked,
    setIsLiked,
    isCollected,
    setIsCollected,
    isFollowing,
    setIsFollowing,
    fetchPostDetail,
    deletePost,
    currentUserShortId, // ← 改名
  } = usePostDetail(initialPost.uuid);

  const {
    comments,
    setComments,
    activeSort,
    setActiveSort,
    hasMore,
    showReplies,
    setShowReplies,
    loadingReplies,
    fetchComments,
    fetchReplies,
    loadMore,
  } = useComments(post?.uuid || initialPost.uuid);

  // 现在传入 isLiked + setIsLiked 和 isCollected + setIsCollected
  const { toggleFollow, toggleReaction } = usePostActions(
    post?.uuid || initialPost.uuid,
    post,
    setPost,
    isFollowing,
    setIsFollowing,
    isLiked,
    setIsLiked,
    isCollected,
    setIsCollected
  );

  const {
    commentText,
    setCommentText,
    showCommentModal,
    setShowCommentModal,
    replyingTo,
    setReplyingTo,
    handleReply,
    handleDeleteComment,
    submitComment,
    toggleCommentLike,
    toggleReplyLike,
  } = useCommentActions(
    post?.uuid || initialPost.uuid,
    comments,
    setComments,
    setPost,
    setShowReplies
  );

  const handleDeletePost = () => {
    Alert.alert('确认删除', '删除后无法恢复，确定删除此帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const success = await deletePost();
          if (success) {
            Alert.alert('已删除', '帖子已删除');
            if (onDeleteSuccess) {
              onDeleteSuccess(initialPost.uuid);
            }
            navigation.goBack();
          } 
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await fetchPostDetail();
    await fetchComments(0);
    setRefreshing(false);
  };

  const scrollToComments = () => {
    listRef.current?.scrollToOffset({
      offset: commentY,
      animated: true,
    });
  };

  if (loading || !post) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#d81e06" />
        <Text style={{ marginTop: 12, color: '#666' }}>加载帖子详情中...</Text>
      </View>
    );
  }

  // 全屏状态处理
  const handleFullscreenChange = (fullscreen: boolean) => {
    console.log('[PostDetailScreen] Fullscreen change:', fullscreen);
    setIsVideoFullscreen(fullscreen);
  };

  console.log('[PostDetailScreen] Render state:', {
    isVideoFullscreen,
    postUuid: post?.uuid,
    postMediaType: post?.mediaType
  });

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <StatusBar barStyle="dark-content" />
      
      {/* 主要内容区域 - 暂时总是显示，不受全屏状态影响 */}
      {/* {!isVideoFullscreen && (*/}
      {true && (
=======
      <StatusBar 
        barStyle={isVideoFullscreen ? "light-content" : "dark-content"} 
        hidden={isVideoFullscreen}
        animated={true}
      />
      
      {/* 主要内容区域 - 当视频不是全屏时显示 */}
      {!isVideoFullscreen && (
>>>>>>> c99daa6 (Initial commit - Clean project state)
        <>
          <FlatList
            ref={listRef}
            ListHeaderComponent={
              <>
                <PostHeader
                  post={post}
                  isFollowing={isFollowing}
                  currentUserShortId={currentUserShortId}
                  onFollow={toggleFollow}
                  onDelete={handleDeletePost}
                />
                <PostContent post={post} onFullscreenChange={handleFullscreenChange} />
                <CommentSection
                  activeSort={activeSort}
                  onSortChange={setActiveSort}
                  onLayout={(y) => setCommentY(y)}
                />
              </>
            }
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                currentUserShortId={currentUserShortId}
                showReplies={showReplies.has(item.id)}
                loadingReplies={loadingReplies.has(item.id)}
                onLike={() => toggleCommentLike(item.id)}
                onReply={() => handleReply(item)}
                onDelete={() => handleDeleteComment(item.id)}
                onToggleReplies={() => {
                  if (showReplies.has(item.id)) {
                    setShowReplies((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(item.id);
                      return newSet;
                    });
                  } else {
                    fetchReplies(item.id);
                  }
                }}
                onReplyLike={toggleReplyLike}
                onReplyToReply={handleReply}
                onDeleteReply={(replyId, parentId) => handleDeleteComment(replyId, parentId)}
              />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />

          <ActionBar
            post={post}
            isLiked={isLiked}
            isCollected={isCollected}
            onComment={() => setShowCommentModal(true)}
            onLike={() => toggleReaction('LIKE')}
            onCollect={() => toggleReaction('COLLECT')}
            onScrollToComments={scrollToComments}
          />

          <CommentModal
            visible={showCommentModal}
            commentText={commentText}
            replyingTo={replyingTo}
            onChangeText={setCommentText}
            onClose={() => {
              setShowCommentModal(false);
              setReplyingTo(null);
            }}
            onSubmit={submitComment}
          />
        </>
      )}
<<<<<<< HEAD
=======

      {/* 全屏视频播放器 - 在最顶层渲染 */}
      {isVideoFullscreen && post && post.mediaType === 'VIDEO' && post.videoUrl && (
        <VideoPlayer
          source={post.videoUrl}
          poster={post.videoCoverUrl}
          fullscreen={true}
          autoPlay={true}
          defaultMuted={false}
          onExitFullscreen={() => {
            console.log('[PostDetailScreen] Exiting fullscreen');
            setIsVideoFullscreen(false);
          }}
          onError={(error) => {
            console.error('[PostDetailScreen] Fullscreen video error:', error);
            Alert.alert('播放错误', '全屏视频播放失败');
            setIsVideoFullscreen(false);
          }}
        />
      )}
>>>>>>> c99daa6 (Initial commit - Clean project state)
    </View>
  );
}
