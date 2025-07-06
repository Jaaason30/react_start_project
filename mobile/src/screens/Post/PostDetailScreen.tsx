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
  // 新增回复相关字段
  parentCommentUuid?: string;
  replyToUser?: {
    uuid: string;
    nickname: string;
  };
  replyCount: number;
  replies?: CommentType[];
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

  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // 新增回复相关状态
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    userName: string;
    parentCommentUuid?: string;
    replyToUserUuid?: string;
  } | null>(null);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  /* ========== 删除帖子 ========== */
  const handleDeletePost = () => {
    Alert.alert('确认删除', '删除后无法恢复，确定删除此帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(
              `${FULL_BASE_URL}/api/posts/${post!.uuid}` +
                `?operatorUuid=${profileData.uuid}`,
              { method: 'DELETE', credentials: 'include' }
            );
            Alert.alert('已删除', '帖子已删除');
            navigation.goBack();
          } catch (err) {
            console.error('[❌ deletePost]', err);
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  /* ========== 1) 获取帖子详情（带关注状态） ========== */
const patchUrl = (url?: string) =>
  !url
    ? null
    : url.startsWith('http')
    ? url
    : `${FULL_BASE_URL}${url}`;

// ── 修改 fetchPostDetail：去掉内部 setLoading，改用 patchUrl
const fetchPostDetail = async () => {
  try {
    const res = await fetch(
      `${FULL_BASE_URL}/api/posts/${initialPost.uuid}?userUuid=${profileData.uuid}`,
      { credentials: 'include' }
    );
    const data = await res.json();

    // 用 patchUrl 处理头像和图片
    const avatarUrl =
      patchUrl(data.author?.profilePictureUrl) ||
      'https://via.placeholder.com/200x200.png?text=No+Avatar';
    const processedImages = (data.images || []).map((img: any) =>
      patchUrl(img.url) || img.url
    );
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
    setIsLiked(!!data.likedByCurrentUser);
    setIsCollected(!!data.collectedByCurrentUser);
    setIsFollowing(newPost.followedByCurrentUser);
  } catch (err) {
    console.error('[❌ fetchPostDetail]', err);
  }
};

  /* ========== 2) 获取评论 ========== */
const fetchComments = async (pageNumber = 0) => {
  console.log(`[fetchComments] page: ${pageNumber}, sort: ${activeSort}`);
  try {
    // 1) 根据 activeSort 映射后端枚举参数
    const sortParam = activeSort === '最新' ? 'LATEST' : 'HOT';

    // 2) 构建请求 URL，携带 sortType、userUuid、分页和 loadReplies 参数
    const url =
      `${FULL_BASE_URL}/api/posts/${initialPost.uuid}/comments` +
      `?sortType=${sortParam}` +
      `&userUuid=${profileData.uuid}` +
      `&page=${pageNumber}&size=10&loadReplies=true`;
    console.log('[fetchComments] fetching from:', url);

    // 3) 发起请求
    const res = await fetch(url, { credentials: 'include' });
    console.log('[fetchComments] response status:', res.status);

    // 4) 解析返回
    const data = await res.json();
    console.log('[fetchComments] raw data:', JSON.stringify(data, null, 2));

    // 5) 处理主评论及其回复列表
    const newComments: CommentType[] = (data.content || []).map((c: any) => {
      // 5.1) 标准化处理回复数组
      const processedReplies: CommentType[] = (c.replies || []).map((r: any) => ({
        id: r.uuid,
        authorUuid: r.author.uuid,
        user: r.author.nickname,
        avatar: r.author.profilePictureUrl
          ? `${FULL_BASE_URL}${r.author.profilePictureUrl}`
          : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
        content: r.content,
        time: new Date(r.createdAt).toLocaleString(),
        likes: r.likeCount ?? 0,
        liked: !!r.likedByCurrentUser,
        parentCommentUuid: r.parentCommentUuid,
        replyToUser: r.replyToUser,
        replyCount: 0,
      }));
      console.log('[fetchComments] processedReplies for', c.uuid, processedReplies);

      // 5.2) 标准化主评论
      return {
        id: c.uuid,
        authorUuid: c.author.uuid,
        user: c.author.nickname,
        avatar: c.author.profilePictureUrl
          ? `${FULL_BASE_URL}${c.author.profilePictureUrl}`
          : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
        content: c.content,
        time: new Date(c.createdAt).toLocaleString(),
        likes: c.likeCount ?? 0,
        liked: !!c.likedByCurrentUser,
        parentCommentUuid: c.parentCommentUuid,
        replyToUser: c.replyToUser,
        replyCount: c.replyCount || 0,
        replies: processedReplies,
      };
    });

    console.log('[fetchComments] newComments:', newComments);

    // 6) 更新 state：第一页覆盖，后续页追加
    setComments(prev =>
      pageNumber === 0 ? newComments : [...prev, ...newComments]
    );
    setHasMore(!data.last);
  } catch (err) {
    console.error('[❌ fetchComments]', err);
  }
};


  /* ========== 加载评论的回复 ========== */
const fetchReplies = async (commentId: string) => {
  console.log(`[fetchReplies] commentId: ${commentId}`);
  setLoadingReplies(prev => new Set(prev).add(commentId));
  try {
    const url = `${FULL_BASE_URL}/api/comments/${commentId}/replies?userUuid=${profileData.uuid}&page=0&size=20`;
    console.log('[fetchReplies] fetching from:', url);
    const res = await fetch(url, { credentials: 'include' });
    console.log('[fetchReplies] response status:', res.status);
    const data = await res.json();
    console.log('[fetchReplies] raw data:', JSON.stringify(data, null, 2));

    const replies = (data.content || []).map((r: any) => {
      const replyLog = {
        uuid: r.uuid,
        authorUuid: r.author?.uuid,
        nickname: r.author?.nickname,
        profilePictureUrl: r.author?.profilePictureUrl,
        likedByCurrentUser: r.likedByCurrentUser,
        likeCount: r.likeCount,
      };
      console.log('[fetchReplies] processed reply:', replyLog);

      return {
        id: r.uuid,
        authorUuid: r.author.uuid,
        user: r.author.nickname,
        avatar: r.author.profilePictureUrl
          ? `${FULL_BASE_URL}${r.author.profilePictureUrl}`
          : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
        content: r.content,
        time: new Date(r.createdAt).toLocaleString(),
        likes: r.likeCount,
        liked: !!r.likedByCurrentUser,
        parentCommentUuid: r.parentCommentUuid,
        replyToUser: r.replyToUser,
        replyCount: 0,
      };
    });

    console.log('[fetchReplies] processed replies:', replies);
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies } 
          : comment
      )
    );
    setShowReplies(prev => new Set(prev).add(commentId));
  } catch (err) {
    console.error('[❌ fetchReplies]', err);
  } finally {
    setLoadingReplies(prev => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  }
};


  /* ========== 开始回复评论 ========== */
  const handleReply = (comment: CommentType) => {
    setReplyingTo({
      commentId: comment.id,
      userName: comment.user,
      parentCommentUuid: comment.parentCommentUuid || comment.id,
      replyToUserUuid: comment.authorUuid,
    });
    setShowCommentModal(true);
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
  const loadInitial = async () => {
    setLoading(true);
    await fetchPostDetail();
    setLoading(false);
  };
  loadInitial();
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
      // 当前用户是帖子作者时，刷新帖子数据
      if (post?.authorUuid === profileData.uuid) {
        fetchPostDetail();
      }
      
      return () => {}; // 清理函数
    }, [post?.authorUuid, profileData.uuid])
  );

const onRefresh = async () => {
  setRefreshing(true);
  await refreshProfile();
  await fetchPostDetail();
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
              {/* 删除按钮 - 仅作者可见 */}
              {profileData?.uuid === post.authorUuid && (
                <TouchableOpacity onPress={handleDeletePost} style={{ marginLeft: 16 }}>
                  <Ionicons name="trash-outline" size={24} color="#d81e06" />
                </TouchableOpacity>
              )}
              <FastImage
                source={{ 
                  uri: post.authorAvatar,
                  headers: { 'Cache-Control': 'no-cache' },
                  priority: FastImage.priority.high 
                }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.authorName}>{post.author}</Text>
              {/* 关注按钮 - 非作者本人时显示 */}
              {profileData?.uuid !== post.authorUuid && (
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
              )}
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
          <>
            <View style={styles.commentItem}>
              <FastImage
                source={{ 
                  uri: item.avatar,
                  headers: { 'Cache-Control': 'no-cache' },
                  priority: FastImage.priority.normal
                }}
                style={styles.commentAvatar}
                resizeMode={FastImage.resizeMode.cover}
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
                    
                    {/* 新增回复按钮 */}
                    <TouchableOpacity
                      onPress={() => handleReply(item)}
                      style={{ marginLeft: 16 }}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color="#888" />
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
                
                {/* 显示回复对象 */}
                {item.replyToUser && (
                  <Text style={styles.replyToText}>
                    回复 @{item.replyToUser.nickname}
                  </Text>
                )}
                
                <Text style={styles.commentContent}>{item.content}</Text>
                <Text style={styles.commentTime}>{item.time}</Text>
                
                {/* 查看回复按钮 */}
                {item.replyCount > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      if (showReplies.has(item.id)) {
                        setShowReplies(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.id);
                          return newSet;
                        });
                      } else {
                        fetchReplies(item.id);
                      }
                    }}
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
              </View>
            </View>
            
            {/* 渲染回复列表 */}
            {showReplies.has(item.id) && item.replies && item.replies.map(reply => (
              <View key={reply.id} style={[styles.commentItem, styles.replyItem]}>
                <FastImage
                  source={{ 
                    uri: reply.avatar,
                    headers: { 'Cache-Control': 'no-cache' },
                    priority: FastImage.priority.normal
                  }}
                  style={styles.commentAvatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <View style={styles.commentTopRow}>
                    <Text style={styles.commentUser}>{reply.user}</Text>
                    {reply.replyToUser && (
                      <Text style={styles.replyToInline}>
                        回复 @{reply.replyToUser.nickname}
                      </Text>
                    )}
                    <View style={styles.commentActions}>
                      <TouchableOpacity
                        style={styles.likeButton}
                        onPress={async () => {
                          if (!profileData?.uuid) return;
                          try {
                            const res = await fetch(
                              `${FULL_BASE_URL}/api/comments/${reply.id}/likes` +
                                `?userUuid=${profileData.uuid}`,
                              { method: 'POST', credentials: 'include' }
                            );
                            const updated: any = await res.json();
                            // 更新回复的点赞状态
                            setComments(prev =>
                              prev.map(c => ({
                                ...c,
                                replies: c.replies?.map(r =>
                                  r.id === reply.id
                                    ? {
                                        ...r,
                                        likes: updated.likeCount,
                                        liked: updated.likedByCurrentUser,
                                      }
                                    : r
                                ),
                              }))
                            );
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <Ionicons
                          name={reply.liked ? 'heart' : 'heart-outline'}
                          size={14}
                          color={reply.liked ? '#f33' : '#888'}
                        />
                        <Text
                          style={[
                            styles.replyLikes,
                            reply.liked && { color: '#f33' },
                          ]}
                        >
                          {reply.likes}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReply(reply)}
                        style={{ marginLeft: 12 }}
                      >
                        <Ionicons name="chatbubble-outline" size={14} color="#888" />
                      </TouchableOpacity>

                      {profileData?.uuid === reply.authorUuid && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(reply.id)}
                          style={{ marginLeft: 12 }}
                        >
                          <Ionicons name="trash-outline" size={14} color="#888" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Text style={styles.replyContent}>{reply.content}</Text>
                  <Text style={styles.replyTime}>{reply.time}</Text>
                </View>
              </View>
            ))}
          </>
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
        onRequestClose={() => {
          setShowCommentModal(false);
          setReplyingTo(null);
        }}
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
              <TouchableOpacity onPress={() => {
                setShowCommentModal(false);
                setReplyingTo(null);
              }}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInputField}
              placeholder={replyingTo ? `回复 @${replyingTo.userName}...` : "写下你的评论..."}
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
                  // 新增回复相关字段
                  parentCommentUuid: replyingTo?.parentCommentUuid,
                  replyToUserUuid: replyingTo?.replyToUserUuid,
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
                      ? `${FULL_BASE_URL}${data.author.profilePictureUrl}`
                      : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
                    content: data.content,
                    time: new Date(data.createdAt).toLocaleString(),
                    likes: 0,
                    liked: false,
                    replyCount: 0,
                    parentCommentUuid: data.parentCommentUuid,
                    replyToUser: data.replyToUser,
                  };
                  
                  if (replyingTo) {
                    // 如果是回复，更新对应评论的回复列表
                    setComments(prev =>
                      prev.map(c => {
                        if (c.id === replyingTo.parentCommentUuid) {
                          return {
                            ...c,
                            replyCount: c.replyCount + 1,
                            replies: [...(c.replies || []), newComment],
                          };
                        }
                        return c;
                      })
                    );
                    setShowReplies(prev => new Set(prev).add(replyingTo.parentCommentUuid || ''));
                  } else {
                    // 如果是新评论，添加到列表顶部
                    setComments(prev => [newComment, ...prev]);
                  }
                  
                  setCommentText('');
                  setShowCommentModal(false);
                  setReplyingTo(null);
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