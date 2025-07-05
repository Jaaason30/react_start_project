// src/screens/Post/PostDetailScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { styles } from '../../theme/PostDetailScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const FULL_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
const { width } = Dimensions.get('window');

/* ---------- 路由类型 ---------- */
type RootStackParamList = { PostDetail: { post: { uuid: string } } };
type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

/* ---------- 业务类型 ---------- */
type CommentType = {
  id: string;
  authorUuid: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
};
type SortType = '最新' | '最热';
type PostType = {
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

// 添加时间戳到URL以防止缓存
const addTimestampToUrl = (url: string): string => {
  if (!url) return url;
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${timestamp}`;
};

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { post: initialPost } = route.params;
  const { profileData, refreshProfile } = useUserProfile();

  const listRef = useRef<FlatList<CommentType>>(null);
  const [commentY, setCommentY] = useState(0);
  const [post, setPost] = useState<PostType | null>(null);
  const [imageDimensions, setImageDimensions] = useState<
    { width: number; height: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeSort, setActiveSort] = useState<SortType>('最新');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  /* ========== 1) 获取帖子详情（带关注状态） ========== */
  const fetchPostDetail = async () => {
    setLoading(true);
    try {
      const url =
        `${FULL_BASE_URL}/api/posts/${initialPost.uuid}` +
        `?userUuid=${profileData.uuid}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();

      const processedImages = (data.images || []).map((img: { url: string }) =>
        img.url.startsWith('http') ? img.url : `${FULL_BASE_URL}${img.url}`
      );

      // 为头像URL添加时间戳，防止缓存
      const currentTimestamp = Date.now();
      const avatarUrl = data.author?.profilePictureUrl
        ? `${FULL_BASE_URL}${data.author.profilePictureUrl}?t=${currentTimestamp}`
        : 'https://via.placeholder.com/200x200.png?text=No+Avatar';

      const newPost: PostType = {
        uuid: data.uuid,
        title: data.title,
        content: data.content,
        images: processedImages,
        author: data.author?.nickname || '未知用户',
        authorAvatar: avatarUrl,
        authorUuid: data.author?.uuid,
        likeCount: data.likeCount ?? 0,
        collectCount: data.collectCount ?? 0,
        commentCount: data.commentCount ?? 0,
        likedByCurrentUser: !!data.likedByCurrentUser,
        collectedByCurrentUser: !!data.collectedByCurrentUser,
        followedByCurrentUser:
          data.followedByViewer ??
          data.followedByCurrentUser ??
          false,
      };

      setPost(newPost);
      setIsLiked(newPost.likedByCurrentUser);
      setIsCollected(newPost.collectedByCurrentUser);
      setIsFollowing(newPost.followedByCurrentUser);
      
      // 更新时间戳，强制FastImage重新加载
      setImageTimestamp(currentTimestamp);
    } catch (err) {
      console.error('[❌ fetchPostDetail]', err);
    } finally {
      setLoading(false);
    }
  };

  /* ========== 2) 获取评论 ========== */
  const fetchComments = async (pageNumber = 0) => {
    try {
      const sortParam = activeSort === '最新' ? 'LATEST' : 'HOT';
      const url =
        `${FULL_BASE_URL}/api/posts/${initialPost.uuid}/comments` +
        `?sortType=${sortParam}&userUuid=${profileData.uuid}` +
        `&page=${pageNumber}&size=10`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();

      // 为评论头像添加时间戳
      const currentTimestamp = Date.now();
      const newComments = (data.content || []).map((c: any) => ({
        id: c.uuid,
        authorUuid: c.author.uuid,
        user: c.author.nickname,
        avatar: c.author.profilePictureUrl
          ? `${FULL_BASE_URL}${c.author.profilePictureUrl}?t=${currentTimestamp}`
          : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
        content: c.content,
        time: new Date(c.createdAt).toLocaleString(),
        likes: c.likeCount,
        liked: !!c.likedByCurrentUser,
      }));

      setComments(prev =>
        pageNumber === 0 ? newComments : [...prev, ...newComments]
      );
      setHasMore(!data.last);
      
      // 更新时间戳，强制FastImage重新加载
      setImageTimestamp(currentTimestamp);
    } catch (err) {
      console.error('[❌ fetchComments]', err);
    }
  };

  /* ========== 3) 关注 / 取消关注 ========== */
  const toggleFollow = async () => {
    if (!profileData?.uuid || !post) return;
    try {
      const endpoint =
        `${FULL_BASE_URL}/api/user/follow` +
        `?userUuid=${profileData.uuid}` +
        `&targetUuid=${post.authorUuid}`;

      const res = await fetch(endpoint, {
        method: isFollowing ? 'DELETE' : 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setIsFollowing(prev => !prev);
        console.log(isFollowing ? '取消关注成功' : '关注成功');
      } else {
        Alert.alert(isFollowing ? '取消关注失败' : '关注失败');
      }
    } catch (err) {
      console.error('[❌ toggleFollow]', err);
    }
  };

  /* ========== 4) 点赞 / 收藏 ========== */
  const toggleReaction = async (type: 'LIKE' | 'COLLECT') => {
    if (!profileData?.uuid) return;
    try {
      const res = await fetch(
        `${FULL_BASE_URL}/api/posts/${initialPost.uuid}/reactions`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, userUuid: profileData.uuid }),
        }
      );
      console.log(`[toggleReaction ${type}] status:`, res.status);
      const data = await res.json();
      console.log(`[toggleReaction ${type}] response:`, data);
      setPost(prev =>
        prev
          ? {
              ...prev,
              likeCount: data.likeCount,
              collectCount: data.collectCount,
              commentCount: data.commentCount,
              likedByCurrentUser: data.likedByCurrentUser,
              collectedByCurrentUser: data.collectedByCurrentUser,
            }
          : prev
      );
      setIsLiked(data.likedByCurrentUser);
      setIsCollected(data.collectedByCurrentUser);
    } catch (err) {
      console.error(`[❌ toggle ${type}]`, err);
    }
  };

  /* ========== 5) 删除评论 ========== */
  const handleDeleteComment = (id: string) => {
    Alert.alert('确认删除', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(
              `${FULL_BASE_URL}/api/comments/${id}?userUuid=${profileData.uuid}`,
              { method: 'DELETE', credentials: 'include' }
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

  /* ========== 6) 计算图片尺寸 ========== */
  useEffect(() => {
    if (!post?.images?.length) return;
    (async () => {
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
    })();
  }, [post?.images]);

  /* ========== 7) 初次加载 & 依赖变化 ========== */
  useEffect(() => {
    fetchPostDetail();
  }, [initialPost.uuid]);

  useEffect(() => {
    fetchComments(0);
    setPage(0);
  }, [initialPost.uuid, activeSort]);

  // 当用户资料发生变化时，特别是头像更新时，重新获取帖子详情
  useEffect(() => {
    if (post?.authorUuid === profileData.uuid) {
      fetchPostDetail();
    }
  }, [profileData.profilePictureUrl]);

  // 使用useFocusEffect确保每次页面聚焦时都刷新数据
  useFocusEffect(
    React.useCallback(() => {
      // 更新时间戳，强制FastImage重新加载
      setImageTimestamp(Date.now());
      
      // 当前用户是帖子作者时，刷新帖子数据
      if (post?.authorUuid === profileData.uuid) {
        fetchPostDetail();
      }
      
      return () => {}; // 清理函数
    }, [post?.authorUuid, profileData.uuid])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // 刷新用户资料
    await refreshProfile();
    // 刷新帖子详情
    await fetchPostDetail();
    // 刷新评论
    await fetchComments(0);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchComments(next);
  };

  const scrollToComments = () => {
    listRef.current?.scrollToOffset({ offset: commentY, animated: true });
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
            {/* 顶部导航 + 作者信息 */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} />
              </TouchableOpacity>
              <FastImage
                source={{ 
                  uri: post.authorAvatar,
                  headers: { 'Cache-Control': 'no-cache' },
                  priority: FastImage.priority.high 
                }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
                key={`avatar-${imageTimestamp}`}
              />
              <Text style={styles.authorName}>{post.author}</Text>
              <TouchableOpacity
                style={isFollowing ? styles.unfollowBtn : styles.followBtn}
                onPress={toggleFollow}
              >
                <Text
                  style={isFollowing ? styles.unfollowText : styles.followText}
                >
                  {isFollowing ? '取消关注' : '关注'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 图片轮播 */}
            <FlatList
              horizontal
              data={post.images}
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
                        (imageDimensions[index]?.height! /
                          imageDimensions[index]?.width!) *
                        width,
                    },
                  ]}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )}
            />

            {/* 标题 & 正文 */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.body}>{post.content || '暂无内容'}</Text>
            </View>

            {/* 评论区头部 */}
            <View
              onLayout={e => setCommentY(e.nativeEvent.layout.y)}
              style={styles.commentHeader}
            >
              <Text style={styles.commentHeaderText}>全部评论</Text>
              <View style={styles.commentTabs}>
                {(['最新', '最热'] as SortType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setActiveSort(t)}
                    style={[
                      styles.commentTab,
                      activeSort === t && styles.activeCommentTab,
                    ]}
                  >
                    <Text
                      style={[
                        styles.commentTabText,
                        activeSort === t && styles.activeCommentTabText,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        }
        data={comments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <FastImage
              source={{ 
                uri: item.avatar,
                headers: { 'Cache-Control': 'no-cache' },
                priority: FastImage.priority.normal
              }}
              style={styles.commentAvatar}
              resizeMode={FastImage.resizeMode.cover}
              key={`comment-avatar-${item.id}-${imageTimestamp}`}
            />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentUser}>{item.user}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={async () => {
                      if (!profileData?.uuid) return;
                      try {
                        const res = await fetch(
                          `${FULL_BASE_URL}/api/comments/${item.id}/likes` +
                            `?userUuid=${profileData.uuid}`,
                          { method: 'POST', credentials: 'include' }
                        );
                        const updated: any = await res.json();
                        setComments(prev =>
                          prev.map(c =>
                            c.id === item.id
                              ? {
                                  ...c,
                                  likes: updated.likeCount,
                                  liked: updated.likedByCurrentUser,
                                }
                              : c
                          )
                        );
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    <Ionicons
                      name={item.liked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={item.liked ? '#f33' : '#888'}
                    />
                    <Text
                      style={[
                        styles.commentLikes,
                        item.liked && { color: '#f33' },
                      ]}
                    >
                      {item.likes}
                    </Text>
                  </TouchableOpacity>
                  {profileData?.uuid === item.authorUuid && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item.id)}
                      style={{ marginLeft: 16 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={styles.commentContent}>{item.content}</Text>
              <Text style={styles.commentTime}>{item.time}</Text>
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* 底部操作栏 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.commentInput}
          onPress={() => setShowCommentModal(true)}
        >
          <Ionicons name="pencil-outline" size={16} color="#888" />
          <Text style={styles.commentText}>说点什么…</Text>
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleReaction('LIKE')}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#f33' : '#888'}
            />
            <Text style={[styles.count, isLiked && { color: '#f33' }]}>
              {post.likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleReaction('COLLECT')}
          >
            <Ionicons
              name={isCollected ? 'star' : 'star-outline'}
              size={22}
              color={isCollected ? '#fc0' : '#888'}
            />
            <Text style={[styles.count, isCollected && { color: '#fc0' }]}>
              {post.collectCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={scrollToComments}
          >
            <Ionicons name="chatbubble-outline" size={22} />
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
              <Text style={styles.modalTitle}>添加评论</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInputField}
              placeholder="写下你的评论..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                !commentText.trim() && styles.disabledButton,
              ]}
              disabled={!commentText.trim()}
              onPress={async () => {
                const payload = {
                  content: commentText.trim(),
                  authorUuid: profileData?.uuid,
                };
                try {
                  const res = await fetch(
                    `${FULL_BASE_URL}/api/posts/${initialPost.uuid}/comments`,
                    {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    }
                  );
                  const data = await res.json();
                  const newComment: CommentType = {
                    id: data.uuid,
                    authorUuid: data.author.uuid,
                    user: data.author.nickname,
                    avatar: data.author.profilePictureUrl
                      ? `${FULL_BASE_URL}${data.author.profilePictureUrl}?t=${Date.now()}`
                      : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
                    content: data.content,
                    time: new Date(data.createdAt).toLocaleString(),
                    likes: 0,
                    liked: false,
                  };
                  setComments(prev => [newComment, ...prev]);
                  setCommentText('');
                  setShowCommentModal(false);
                  setPost(prev =>
                    prev
                      ? { ...prev, commentCount: prev.commentCount + 1 }
                      : prev
                  );
                } catch (err) {
                  console.error('[❌ addComment]', err);
                }
              }}
            >
              <Text style={styles.submitButtonText}>发布</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default PostDetailScreen;