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
  } = useComments(initialPost.uuid);

  // 现在传入 isLiked + setIsLiked 和 isCollected + setIsCollected
  const { toggleFollow, toggleReaction } = usePostActions(
    initialPost.uuid,
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
    initialPost.uuid,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        ref={listRef}
        ListHeaderComponent={
          <>
            <PostHeader
              post={post}
              isFollowing={isFollowing}
              currentUserShortId={currentUserShortId} // ← 改名
              onFollow={toggleFollow}
              onDelete={handleDeletePost}
            />
            <PostContent post={post} />
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
            currentUserShortId={currentUserShortId} // ← 改名
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
    </View>
  );
}
