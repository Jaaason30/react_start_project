// src/screens/Post/PostDetailScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  LayoutChangeEvent,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { styles } from '../../theme/PostDetailScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS, BASE_URL } from '../../constants/api';

// 屏幕宽度
const { width: screenWidth } = Dimensions.get('window');

// 路由参数类型
type RootStackParamList = {
  PostDetail: { post: { uuid: string } };
};
type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

// 评论类型
export type CommentType = {
  id: string;
  authorUuid: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  parentCommentUuid?: string;
  replyToUser?: { uuid: string; nickname: string };
  replyCount: number;
  replies?: CommentType[];
};

// 排序方式
export type SortType = '最新' | '最热';

// 帖子类型
export type PostType = {
  uuid: string;
  title: string;
  content: string;
  images: string[];
  author: string;
  authorAvatar: string;
  authorUuid: string;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  collectedByCurrentUser: boolean;
  followedByCurrentUser: boolean;
};

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { profileData, avatarVersion, refreshProfile } = useUserProfile();
  const { post: initialPost } = route.params;

  const listRef = useRef<FlatList<CommentType>>(null);
  const [commentHeaderY, setCommentHeaderY] = useState(0);
  const [post, setPost] = useState<PostType | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    userName: string;
    parentCommentUuid?: string;
    replyToUserUuid?: string;
  } | null>(null);

  const [activeSort, setActiveSort] = useState<SortType>('最新');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  // 拼接 URL
  const patchUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };
  const patchProfileUrl = (url?: string) => {
    const u = patchUrl(url) || '';
    return avatarVersion ? `${u}?v=${avatarVersion}` : u;
  };

  // 删除帖子
  const handleDeletePost = () => {
    Alert.alert('确认删除', '删除后无法恢复，确定删除此帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`${API_ENDPOINTS.POST_DETAIL}/${post!.uuid}`);
            Alert.alert('已删除', '帖子已删除');
            navigation.goBack();
          } catch {
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  // 获取帖子详情
  const fetchPostDetail = async () => {
    try {
      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.POST_DETAIL}/${initialPost.uuid}`
      );
      const avatarUrl =
        patchProfileUrl(data.author.profilePictureUrl) ||
        'https://via.placeholder.com/200x200.png?text=No+Avatar';
      const processedImages = (data.images || []).map((img: any) =>
        patchUrl(img.url) || img.url
      );
      const newPost: PostType = {
        uuid: data.uuid,
        title: data.title,
        content: data.content,
        images: processedImages,
        author: data.author.nickname,
        authorAvatar: avatarUrl,
        authorUuid: data.author.uuid,
        likeCount: data.likeCount ?? 0,
        collectCount: data.collectCount ?? 0,
        commentCount: data.commentCount ?? 0,
        likedByCurrentUser: !!data.likedByCurrentUser,
        collectedByCurrentUser: !!data.collectedByCurrentUser,
        followedByCurrentUser: !!data.followedByCurrentUser,
      };
      setPost(newPost);
      setIsLiked(!!data.likedByCurrentUser);
      setIsCollected(!!data.collectedByCurrentUser);
      setIsFollowing(newPost.followedByCurrentUser);
    } catch (err) {
      console.error('[❌ fetchPostDetail]', err);
    }
  };

  // 获取评论列表
  const fetchComments = async (pageNumber = 0) => {
    try {
      const sortParam = activeSort === '最新' ? 'LATEST' : 'HOT';
      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.POST_COMMENTS.replace(':uuid', initialPost.uuid)}` +
          `?sortType=${sortParam}&page=${pageNumber}&size=10&loadReplies=false`
      );
      const parsed: CommentType[] = (data.content || []).map((c: any) => ({
        id: c.uuid,
        authorUuid: c.author.uuid,
        user: c.author.nickname,
        avatar: patchProfileUrl(c.author.profilePictureUrl),
        content: c.content,
        time: new Date(c.createdAt).toLocaleString(),
        likes: c.likeCount ?? 0,
        liked: !!c.likedByCurrentUser,
        parentCommentUuid: c.parentCommentUuid,
        replyToUser: c.replyToUser,
        replyCount: c.replyCount ?? 0,
        replies: [],
      }));
      setComments(prev =>
        pageNumber === 0 ? parsed : [...prev, ...parsed]
      );
      setHasMore(!data.last);
    } catch (err) {
      console.error('[❌ fetchComments]', err);
    }
  };

  // 加载或收起回复
  const handleToggleReplies = (commentId: string) => {
    if (showReplies.has(commentId)) {
      // 收起
      setShowReplies(prev => {
        const s = new Set(prev);
        s.delete(commentId);
        return s;
      });
    } else {
      // 展开并加载
      fetchReplies(commentId);
    }
  };

  // 拉取回复
  const fetchReplies = async (commentId: string) => {
    setLoadingReplies(prev => new Set(prev).add(commentId));
    try {
      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.COMMENT_REPLIES.replace(':id', commentId)}?page=0&size=20`
      );
      const replies: CommentType[] = (data.content || []).map((r: any) => ({
        id: r.uuid,
        authorUuid: r.author.uuid,
        user: r.author.nickname,
        avatar: patchProfileUrl(r.author.profilePictureUrl),
        content: r.content,
        time: new Date(r.createdAt).toLocaleString(),
        likes: r.likeCount ?? 0,
        liked: !!r.likedByCurrentUser,
        parentCommentUuid: r.parentCommentUuid,
        replyToUser: r.replyToUser,
        replyCount: 0,
      }));
      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, replies } : c
        )
      );
      setShowReplies(prev => new Set(prev).add(commentId));
    } catch (err) {
      console.error('[❌ fetchReplies]', err);
    } finally {
      setLoadingReplies(prev => {
        const s = new Set(prev);
        s.delete(commentId);
        return s;
      });
    }
  };

  // 点击回复
  const handleReply = (comment: CommentType) => {
    setReplyingTo({
      commentId: comment.id,
      userName: comment.user,
      parentCommentUuid: comment.parentCommentUuid || comment.id,
      replyToUserUuid: comment.authorUuid,
    });
    setShowCommentModal(true);
  };

  // 关注 / 取关
  const toggleFollow = async () => {
    if (!post) return;
    try {
      if (isFollowing) {
        await apiClient.delete(
          `${API_ENDPOINTS.USER_FOLLOW}?targetUuid=${post.authorUuid}`
        );
      } else {
        await apiClient.post(
          `${API_ENDPOINTS.USER_FOLLOW}?targetUuid=${post.authorUuid}`
        );
      }
      setIsFollowing(prev => !prev);
    } catch (err) {
      Alert.alert(isFollowing ? '取消关注失败' : '关注失败');
    }
  };

  // 点赞/收藏
  const toggleReaction = async (type: 'LIKE' | 'COLLECT') => {
    try {
      const res = await apiClient.post<any>(
        `${API_ENDPOINTS.POST_REACTIONS.replace(':uuid', initialPost.uuid)}`,
        { type }
      );
      const { data } = res;
      setPost(prev =>
        prev
          ? {
              ...prev,
              likeCount: data.likeCount ?? prev.likeCount,
              collectCount: data.collectCount ?? prev.collectCount,
              commentCount: data.commentCount ?? prev.commentCount,
              likedByCurrentUser: !!data.likedByCurrentUser,
              collectedByCurrentUser: !!data.collectedByCurrentUser,
            }
          : prev
      );
      setIsLiked(!!data.likedByCurrentUser);
      setIsCollected(!!data.collectedByCurrentUser);
    } catch (err) {
      Alert.alert('操作失败', '网络错误，请稍后重试');
    }
  };

  // 删除评论
  const handleDeleteComment = (id: string) => {
    Alert.alert('确认删除', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(
              `${API_ENDPOINTS.COMMENT_DELETE.replace(':id', id)}`
            );
            setComments(prev => prev.filter(c => c.id !== id));
            setPost(prev =>
              prev ? { ...prev, commentCount: prev.commentCount - 1 } : prev
            );
          } catch (err) {
            console.error('[❌ deleteComment]', err);
          }
        },
      },
    ]);
  };

  // 提交评论/回复
  const submitComment = async () => {
    if (!commentText.trim()) return;
    const payload = {
      content: commentText.trim(),
      parentCommentUuid: replyingTo?.parentCommentUuid,
      replyToUserUuid: replyingTo?.replyToUserUuid,
    };
    try {
      const { data } = await apiClient.post<any>(
        `${API_ENDPOINTS.POST_COMMENTS.replace(':uuid', initialPost.uuid)}`,
        payload
      );
      const newComment: CommentType = {
        id: data.uuid,
        authorUuid: data.author.uuid,
        user: data.author.nickname,
        avatar: patchProfileUrl(data.author.profilePictureUrl),
        content: data.content,
        time: new Date(data.createdAt).toLocaleString(),
        likes: 0,
        liked: false,
        replyCount: 0,
        parentCommentUuid: data.parentCommentUuid,
      };
      if (replyingTo) {
        setComments(prev =>
          prev.map(c =>
            c.id === replyingTo.parentCommentUuid
              ? {
                  ...c,
                  replyCount: c.replyCount + 1,
                  replies: [...(c.replies || []), newComment],
                }
              : c
          )
        );
        setShowReplies(prev => new Set(prev).add(replyingTo.parentCommentUuid!));
      } else {
        setComments(prev => [newComment, ...prev]);
      }
      setCommentText('');
      setReplyingTo(null);
      setShowCommentModal(false);
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
    } catch (err) {
      console.error('[❌ submitComment]', err);
    }
  };

  // 计算图片尺寸
  useEffect(() => {
    if (!post?.images?.length) return;
    Promise.all(
      post.images.map(url =>
        new Promise<{ width: number; height: number }>(resolve => {
          Image.getSize(
            url,
            (w, h) => resolve({ width: w, height: h }),
            () => resolve({ width: screenWidth, height: screenWidth })
          );
        })
      )
    ).then(setImageDimensions);
  }, [post?.images]);

  // 初次加载帖子详情
  useEffect(() => {
    setLoading(true);
    fetchPostDetail().finally(() => setLoading(false));
  }, [initialPost.uuid]);

  // 加载评论
  useEffect(() => {
    fetchComments(0);
    setPage(0);
  }, [initialPost.uuid, activeSort]);

  // 用户更新头像时刷新
  useEffect(() => {
    if (post?.authorUuid === profileData?.uuid) fetchPostDetail();
  }, [avatarVersion]);

  // 页面聚焦时刷新自己帖子
  useFocusEffect(
    useCallback(() => {
      if (post?.authorUuid === profileData?.uuid) fetchPostDetail();
    }, [post?.authorUuid, profileData?.uuid])
  );

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await fetchPostDetail();
    await fetchComments(0);
    setRefreshing(false);
  };

  // 上拉分页
  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchComments(next);
  };

  // 滚动到评论区
  const scrollToComments = () => {
    listRef.current?.scrollToOffset({
      offset: commentHeaderY,
      animated: true,
    });
  };

  if (loading || !post) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d81e06" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        ref={listRef}
        data={comments}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <>
            {/* 顶部导航栏 */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} />
              </TouchableOpacity>
              {post.authorUuid === profileData?.uuid ? (
                <TouchableOpacity onPress={handleDeletePost} style={{ marginLeft: 16 }}>
                  <Ionicons name="trash-outline" size={24} color="#d81e06" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={toggleFollow}
                  style={isFollowing ? styles.unfollowBtn : styles.followBtn}
                >
                  <Text style={isFollowing ? styles.unfollowText : styles.followText}>
                    {isFollowing ? '取消关注' : '关注'}
                  </Text>
                </TouchableOpacity>
              )}
              <FastImage
                source={{ uri: post.authorAvatar, headers: { 'Cache-Control': 'no-cache' } }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.authorName}>{post.author}</Text>
            </View>

            {/* 图片轮播 */}
            <FlatList
              horizontal
              data={post.images}
              keyExtractor={(_, idx) => String(idx)}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const dims = imageDimensions[index] || { width: screenWidth, height: screenWidth };
                const height = (dims.height / dims.width) * screenWidth;
                return (
                  <FastImage
                    source={{ uri: item }}
                    style={[styles.image, { height }]}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                );
              }}
            />

            {/* 正文 */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.body}>{post.content || '暂无内容'}</Text>
            </View>

            {/* 评论排序头 */}
            <View
              style={styles.commentHeader}
              onLayout={(e: LayoutChangeEvent) => setCommentHeaderY(e.nativeEvent.layout.y)}
            >
              <Text style={styles.commentHeaderText}>全部评论</Text>
              <View style={styles.commentTabs}>
                {(['最新', '最热'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setActiveSort(t)}
                    style={[styles.commentTab, activeSort === t && styles.activeCommentTab]}
                  >
                    <Text style={[styles.commentTabText, activeSort === t && styles.activeCommentTabText]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <FastImage
              source={{ uri: item.avatar, headers: { 'Cache-Control': 'no-cache' } }}
              style={styles.commentAvatar}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentUser}>{item.user}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => toggleReaction('LIKE')} style={styles.likeButton}>
                    <Ionicons
                      name={item.liked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={item.liked ? '#f33' : '#888'}
                    />
                    <Text style={[styles.commentLikes, item.liked && { color: '#f33' }]}>
                      {item.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleReply(item)} style={{ marginLeft: 16 }}>
                    <Ionicons name="chatbubble-outline" size={16} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={{ marginLeft: 16 }}>
                    <Ionicons name="trash-outline" size={16} color="#888" />
                  </TouchableOpacity>
                </View>
              </View> 
              {item.replyToUser && (
                <Text style={styles.replyToInline}>
                  回复 @{item.replyToUser.nickname}
                </Text>
              )}
              <Text style={styles.commentContent}>{item.content}</Text>
              <Text style={styles.commentTime}>{item.time}</Text>
              {item.replyCount > 0 && (
                <TouchableOpacity
                  onPress={() => handleToggleReplies(item.id)}
                  style={styles.viewRepliesButton}
                >
                  <Text style={styles.viewRepliesText}>
                    {loadingReplies.has(item.id)
                      ? '加载中...'
                      : showReplies.has(item.id)
                      ? '收起回复'
                      : `查看 ${item.replyCount} 条回复`}
                  </Text>
                </TouchableOpacity>
              )}
              {showReplies.has(item.id) && item.replies?.map(reply => (
                <View key={reply.id} style={[styles.commentItem, styles.replyItem]}>
                  <FastImage
                    source={{ uri: reply.avatar, headers: { 'Cache-Control': 'no-cache' } }}
                    style={styles.commentAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentTopRow}>
                      <Text style={styles.commentUser}>{reply.user}</Text>
                      {reply.replyToUser && (
                        <Text style={styles.replyToInline}>
                          回复 @{reply.replyToUser.nickname}
                        </Text>
                      )}
                      <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => toggleReaction('LIKE')} style={styles.likeButton}>
                          <Ionicons
                            name={reply.liked ? 'heart' : 'heart-outline'}
                            size={14}
                            color={reply.liked ? '#f33' : '#888'}
                          />
                          <Text style={[styles.replyLikes, reply.liked && { color: '#f33' }]}>
                            {reply.likes}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReply(reply)} style={{ marginLeft: 12 }}>
                          <Ionicons name="chatbubble-outline" size={14} color="#888" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteComment(reply.id)} style={{ marginLeft: 12 }}>
                          <Ionicons name="trash-outline" size={14} color="#888" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.replyContent}>{reply.content}</Text>
                    <Text style={styles.replyTime}>{reply.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* 底部操作栏 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.commentInput} onPress={scrollToComments}>
          <Ionicons name="pencil-outline" size={16} color="#888" />
          <Text style={styles.commentText}>说点什么…</Text>
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => toggleReaction('LIKE')}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#f33' : '#888'} />
            <Text style={[styles.count, isLiked && { color: '#f33' }]}>{post.likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => toggleReaction('COLLECT')}>
            <Ionicons name={isCollected ? 'star' : 'star-outline'} size={22} color={isCollected ? '#fc0' : '#888'} />
            <Text style={[styles.count, isCollected && { color: '#fc0' }]}>{post.collectCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => setShowCommentModal(true)}>
            <Ionicons name="chatbubble-outline" size={22} color="#888" />
            <Text style={styles.count}>{post.commentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 评论输入弹窗 */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {replyingTo ? `回复 @${replyingTo.userName}` : '添加评论'}
              </Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInputField}
              placeholder={replyingTo ? `回复 @${replyingTo.userName}...` : '写下你的评论...'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[styles.submitButton, !commentText.trim() && styles.disabledButton]}
              disabled={!commentText.trim()}
              onPress={submitComment}
            >
              <Text style={styles.submitButtonText}>发布</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
