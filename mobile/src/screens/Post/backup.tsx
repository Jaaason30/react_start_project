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
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { styles } from '../../theme/PostDetailScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

// 使用 apiClient 和 API_ENDPOINTS
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS, BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

/* ---------- 路由类型 ---------- */
type RootStackParamList = {
  PostDetail: { post: { uuid: string } };
};
type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

/* ---------- 评论和帖子的类型 ---------- */
type CommentType = {
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
export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { post: initialPost } = route.params;
  const { profileData, refreshProfile, avatarVersion } = useUserProfile();

  // ------- refs & state -------
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

  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    userName: string;
    parentCommentUuid?: string;
    replyToUserUuid?: string;
  } | null>(null);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(
    new Set()
  );

  // ------- 工具：拼接资源的 URL -------
const patchUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const full = `${BASE_URL}${url}`;
  //console.log('[patchUrl] input:', url, '=>', full);
  return full;
};

const patchProfileUrl = (url?: string) => {
  const u = patchUrl(url);
  const finalUrl = u && avatarVersion ? `${u}?v=${avatarVersion}` : u || undefined;
  //console.log('[patchProfileUrl] raw:', url, 'version:', avatarVersion, '=>', finalUrl);
  return finalUrl;
};
  /* ========== 删除帖子 (JWT) ========== */
  const handleDeletePost = () => {
    Alert.alert('确认删除', '删除后无法恢复，确定删除此帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(
              `${API_ENDPOINTS.POST_DETAIL}/${post!.uuid}`
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

  /* ========== 1) 获取帖子详情 (JWT) ========== */
  const fetchPostDetail = async () => {
    try {
      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.POST_DETAIL}/${initialPost.uuid}`
      );

      const avatarUrl =
        patchProfileUrl(data.author?.profilePictureUrl) ||
        'https://via.placeholder.com/200x200.png?text=No+Avatar';
        console.log('[fetchPostDetail] author avatar:', avatarUrl);


      const processedImages = (data.images || []).map(
        (img: any) => patchUrl(img.url) || img.url
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
        followedByCurrentUser: data.followedByCurrentUser ?? false,
      };

      setPost(newPost);
      setIsLiked(!!data.likedByCurrentUser);
      setIsCollected(!!data.collectedByCurrentUser);
      setIsFollowing(newPost.followedByCurrentUser);
    } catch (err) {
      console.error('[❌ fetchPostDetail]', err);
    }
  };

  /* ========== 2) 获取评论 (JWT) ========== */
  const fetchComments = async (pageNumber = 0) => {
    //console.log(`[fetchComments] page: ${pageNumber}, sort: ${activeSort}`);
    try {
      const sortParam = activeSort === '最新' ? 'LATEST' : 'HOT';

      const { data } = await apiClient.get<any>(
        `${API_ENDPOINTS.POST_COMMENTS.replace(':uuid', initialPost.uuid)}` +
          `?sortType=${sortParam}` +
          `&page=${pageNumber}&size=10&loadReplies=true`
      );

      const newComments: CommentType[] = (data.content || []).map((c: any) => {
        const processedReplies: CommentType[] = (c.replies || []).map((r: any) => ({
          id: r.uuid,
          authorUuid: r.author.uuid,
          user: r.author.nickname,
          avatar:
            patchProfileUrl(r.author.profilePictureUrl) ||
            'https://via.placeholder.com/100x100.png?text=No+Avatar',
          content: r.content,
          time: new Date(r.createdAt).toLocaleString(),
          likes: r.likeCount ?? 0,
          liked: !!r.likedByCurrentUser,
          parentCommentUuid: r.parentCommentUuid,
          replyToUser: r.replyToUser,
          replyCount: 0,
        }));

        return {
          id: c.uuid,
          authorUuid: c.author.uuid,
          user: c.author.nickname,
          avatar:
            patchProfileUrl(c.author.profilePictureUrl) ||
            'https://via.placeholder.com/100x100.png?text=No+Avatar',
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

      setComments(prev =>
        pageNumber === 0 ? newComments : [...prev, ...newComments]
      );
      setHasMore(!data.last);
    } catch (err) {
      console.error('[❌ fetchComments]', err);
    }
  };

  /* ========== 3) 加载评论的回复 (JWT) ========== */

const fetchReplies = async (commentId: string) => {
  console.log(`[📥 fetchReplies] 请求加载回复中 (commentId: ${commentId})`);
  setLoadingReplies(prev => new Set(prev).add(commentId));

  try {
    const url = `${API_ENDPOINTS.COMMENT_REPLIES.replace(':id', commentId)}?page=0&size=20`;
    const { data } = await apiClient.get<any>(url);

    const replies: CommentType[] = (data.content || [])
      .filter(r => r != null)
      .map(r => ({
        id: r.uuid,
        authorUuid: r.author.uuid,
        user: r.author.nickname,
        avatar: patchProfileUrl(r.author.profilePictureUrl) ||
                'https://via.placeholder.com/100x100.png?text=No+Avatar',
        content: r.content,
        time: new Date(r.createdAt).toLocaleString(),
        likes: r.likeCount,
        liked: !!r.likedByCurrentUser,
        parentCommentUuid: r.parentCommentUuid,
        replyToUser: r.replyToUser,
        replyCount: 0,
      }));

    console.log(`[✅ fetchReplies] 获取到 ${replies.length} 条回复，更新评论`);

    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, replies } : c
      )
    );

    setShowReplies(prev => {
      const newSet = new Set(prev);
      newSet.add(commentId);
      return newSet;
    });
  } catch (err: any) {
    console.error(`[❌ fetchReplies] 加载失败 - commentId: ${commentId}`);
    if (err.response) {
      console.error('响应状态:', err.response.status);
      console.error('响应数据:', err.response.data);
    } else {
      console.error('错误信息:', err.message);
    }
  } finally {
    setLoadingReplies(prev => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
    console.log(`[🏁 fetchReplies] 处理完成 - commentId: ${commentId}`);
  }
};

  // 开始回复评论
  const handleReply = (comment: CommentType) => {
    setReplyingTo({
      commentId: comment.id,
      userName: comment.user,
      parentCommentUuid: comment.parentCommentUuid || comment.id,
      replyToUserUuid: comment.authorUuid,
    });
    setShowCommentModal(true);
  };

  /* ========== 4) 关注 / 取消关注 (JWT) ========== */
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
      console.error('[❌ toggleFollow]', err);
      Alert.alert(isFollowing ? '取消关注失败' : '关注失败');
    }
  };

  /* ========== 5) 点赞 / 收藏 (JWT) ========== */
const toggleReaction = async (type: 'LIKE' | 'COLLECT') => {
  try {
    const response = await apiClient.post<any>(
      `${API_ENDPOINTS.POST_REACTIONS.replace(':uuid', initialPost.uuid)}`,
      { type }
    );
    console.log(`[toggleReaction] Full response:`, response);
    console.log(`[toggleReaction] Response status:`, response.status);
    console.log(`[toggleReaction] Response data:`, response.data);
    // 添加空值检查
    if (!response.data) {
      console.error(`[❌ toggleReaction ${type}] Response data is null`);
      // 可以选择显示错误提示
      Alert.alert('操作失败', '服务器响应异常，请稍后重试');
      return;
    } 
    
    const { data } = response;
    
    // 更新帖子状态 
    setPost(prev =>
      prev
        ? {
            ...prev,
            likeCount: data.likeCount ?? prev.likeCount,
            collectCount: data.collectCount ?? prev.collectCount,
            commentCount: data.commentCount ?? prev.commentCount,
            likedByCurrentUser: data.likedByCurrentUser ?? false,
            collectedByCurrentUser: data.collectedByCurrentUser ?? false,
          }
        : prev
    );
    
    // 更新独立的状态
    setIsLiked(data.likedByCurrentUser ?? false);
    setIsCollected(data.collectedByCurrentUser ?? false);
    
  } catch (err) {
    console.error(`[❌ toggleReaction ${type}]`, err);
    Alert.alert('操作失败', '网络错误，请稍后重试');
  }
};
  /* ========== 6) 删除评论 (JWT) ========== */
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

  /* ========== 7) 发布评论 / 回复 (JWT) ========== */
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
        avatar: data.author.profilePictureUrl
          ? `${BASE_URL}${data.author.profilePictureUrl}`
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
      setPost(prev =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev
      );
    } catch (err) {
      console.error('[❌ submitComment]', err);
    }
  };
  /* ========== 8) 计算图片尺寸 ========== */
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

  /* ========== 9) 初次加载 & 依赖变化 ========== */
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

  useEffect(() => {
    if (post?.authorUuid === profileData?.uuid) {
      fetchPostDetail();
    }
  }, [profileData?.profilePictureUrl]);

  useFocusEffect(
    React.useCallback(() => {
      if (post?.authorUuid === profileData?.uuid) {
        fetchPostDetail();
      }
      return () => {};
    }, [post?.authorUuid, profileData?.uuid])
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
    listRef.current?.scrollToOffset({
      offset: commentY,
      animated: true,
    });
  };
  /* ========== 渲染 ========== */
  if (loading || !post) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#d81e06" />
        <Text style={{ marginTop: 12, color: '#666' }}>
          加载帖子详情中...
        </Text>
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
              {profileData?.uuid === post.authorUuid && (
                <TouchableOpacity
                  onPress={handleDeletePost}
                  style={{ marginLeft: 16 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color="#d81e06"
                  />
                </TouchableOpacity>
              )}
              <FastImage
                source={{
                  uri: post.authorAvatar,
                  headers: { 'Cache-Control': 'no-cache' },
                  priority: FastImage.priority.high,
                }}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.authorName}>{post.author}</Text>
              {profileData?.uuid !== post.authorUuid && (
                <TouchableOpacity
                  style={
                    isFollowing
                      ? styles.unfollowBtn
                      : styles.followBtn
                  }
                  onPress={toggleFollow}
                >
                  <Text
                    style={
                      isFollowing
                        ? styles.unfollowText
                        : styles.followText
                    }
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
                        (imageDimensions[index]?.height /
                          imageDimensions[index]?.width) *
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
              <Text style={styles.body}>
                {post.content || '暂无内容'}
              </Text>
            </View>

            {/* 评论区头部 */}
            <View
              onLayout={e =>
                setCommentY(e.nativeEvent.layout.y)
              }
              style={styles.commentHeader}
            >
              <Text style={styles.commentHeaderText}>
                全部评论
              </Text>
              <View style={styles.commentTabs}>
                {(['最新', '最热'] as SortType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setActiveSort(t)}
                    style={[
                      styles.commentTab,
                      activeSort === t &&
                        styles.activeCommentTab,
                    ]}
                  >
                    <Text
                      style={[
                        styles.commentTabText,
                        activeSort === t &&
                          styles.activeCommentTabText,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        }data={comments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <FastImage
              source={{
                uri: item.avatar,
                headers: { 'Cache-Control': 'no-cache' },
                priority: FastImage.priority.normal,
              }}
                //onLoad={e => console.log('[AuthorAvatar onLoad]', post.authorAvatar)}
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
                      try {
                        const { data: upd } = await apiClient.post<any>(
                          `${API_ENDPOINTS.COMMENT_LIKES.replace(':id', item.id)}`
                        );
                        setComments(prev =>
                          prev.map(c =>
                            c.id === item.id
                              ? {
                                  ...c,
                                  likes: upd.likeCount,
                                  liked: upd.likedByCurrentUser,
                                }
                              : c
                          )
                        );
                      } catch (e) {
                        console.error(e);
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

                  <TouchableOpacity
                    onPress={() => handleReply(item)}
                    style={{ marginLeft: 16 }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="#888"
                    />
                  </TouchableOpacity>

                  {profileData?.uuid === item.authorUuid && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item.id)}
                      style={{ marginLeft: 16 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#888"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {item.replyToUser && (
                <Text style={styles.replyToText}>
                  回复 @{item.replyToUser.nickname}
                </Text>
              )}

              <Text style={styles.commentContent}>
                {item.content}
              </Text>
              <Text style={styles.commentTime}>{item.time}</Text>

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

            {(() => {
            const shouldShow = showReplies.has(item.id);
            const hasReplies = item.replies && item.replies.length > 0;
            return shouldShow && hasReplies &&
              item.replies.map((reply, index) => {
                console.log(`[🔁 回复 ${index + 1}] ID: ${reply.id}，内容: ${reply.content}`);
                
                return (
                  <View
                    key={reply.id}
                    style={[styles.commentItem, styles.replyItem]}
                  >
                    <FastImage
                      source={{
                        uri: reply.avatar,
                        headers: { 'Cache-Control': 'no-cache' },
                        priority: FastImage.priority.normal,
                      }}
                      //onLoad={e => console.log('[CommentAvatar onLoad]', item.id, item.avatar)}
                      style={styles.commentAvatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <View style={styles.commentTopRow}>
                        <Text style={styles.commentUser}>
                          {reply.user}
                        </Text>
                        {reply.replyToUser && (
                          <Text style={styles.replyToInline}>
                            回复 @{reply.replyToUser.nickname}
                          </Text>
                        )}
                        <View style={styles.commentActions}>
                          <TouchableOpacity
                            style={styles.likeButton}
                            onPress={async () => {
                              //console.log(`[点赞回复] 回复ID: ${reply.id}`);
                              try {
                                const { data: upd } = await apiClient.post<any>(
                                  `${API_ENDPOINTS.COMMENT_LIKES.replace(':id', reply.id)}`
                                );
                                //console.log(`[点赞回复] 点赞结果:`, upd);
                                setComments(prev =>
                                  prev.map(c => ({
                                    ...c,
                                    replies: c.replies?.map(r =>
                                      r.id === reply.id
                                        ? {
                                            ...r,
                                            likes: upd.likeCount,
                                            liked: upd.likedByCurrentUser,
                                          }
                                        : r
                                    ),
                                  }))
                                );
                              } catch (e) {
                                //console.error('[点赞回复错误]', e);
                              }
                            }}
                          >
                            <Ionicons
                              name={
                                reply.liked ? 'heart' : 'heart-outline'
                              }
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
                            onPress={() => {
                              console.log(`[回复回复] 回复对象:`, reply);
                              handleReply(reply);
                            }}
                            style={{ marginLeft: 12 }}
                          >
                            <Ionicons
                              name="chatbubble-outline"
                              size={14}
                              color="#888"
                            />
                          </TouchableOpacity>

                          {profileData?.uuid === reply.authorUuid && (
                            <TouchableOpacity
                              onPress={() => {
                                console.log(`[删除回复] 回复ID: ${reply.id}`);
                                handleDeleteComment(reply.id);
                              }}
                              style={{ marginLeft: 12 }}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={14}
                                color="#888"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text style={styles.replyContent}>
                        {reply.content}
                      </Text>
                      <Text style={styles.replyTime}>
                        {reply.time}
                      </Text>
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />{/* 底部操作栏 */}
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
                {replyingTo
                  ? `回复 @${replyingTo.userName}`
                  : '添加评论'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentModal(false);
                  setReplyingTo(null);
                }}
              >
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInputField}
              placeholder={
                replyingTo
                  ? `回复 @${replyingTo.userName}...`
                  : '写下你的评论...'
              }
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


