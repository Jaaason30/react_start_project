// src/screens/Post/PostDetailScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity, Dimensions, StatusBar,
  TextInput, Modal, KeyboardAvoidingView, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { styles } from '../../theme/PostDetailScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const FULL_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
const { width } = Dimensions.get('window');

type RootStackParamList = {
  PostDetail: { post: { uuid: string } };
};

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

type CommentType = {
  id: string;
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
  likeCount: number;
  collectCount: number;
  commentCount: number;
  likedByMe: boolean;
  collectedByMe: boolean;
};

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { post: initialPost } = route.params;
  const { profileData } = useUserProfile();

  const scrollViewRef = useRef<FlatList>(null);
  const [commentY, setCommentY] = useState(0);
  const [post, setPost] = useState<PostType | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }[]>([]);
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

  const fetchPostDetail = async () => {
    try {
      const res = await fetch(`${FULL_BASE_URL}/api/posts/${initialPost.uuid}?userUuid=${profileData.uuid}`);
      const data = await res.json();
      console.log('[📥 POST DETAIL]', data);

      const processedImages = (data.images ?? []).map((img: { url: string }) =>
        img.url.startsWith('http') ? img.url : `${FULL_BASE_URL}${img.url}`
      );

      const newPost: PostType = {
        uuid: data.uuid,
        title: data.title,
        content: data.content,
        images: processedImages,
        author: data.author?.nickname ?? '未知用户',
        authorAvatar: data.author?.profilePictureUrl
          ? `${FULL_BASE_URL}${data.author.profilePictureUrl}`
          : 'https://via.placeholder.com/200x200.png?text=No+Avatar',
        likeCount: data.likeCount ?? 0,
        collectCount: data.collectCount ?? 0,
        commentCount: data.commentCount ?? 0,
        likedByMe: data.likedByMe ?? false,
        collectedByMe: data.collectedByMe ?? false,
      };

      setPost(newPost);
      setIsLiked(newPost.likedByMe);
      setIsCollected(newPost.collectedByMe);
    } catch (error) {
      console.error('[❌ Failed to fetch post detail]', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (pageNumber = 0) => {
    try {
      const res = await fetch(`${FULL_BASE_URL}/api/posts/${initialPost.uuid}/comments?page=${pageNumber}&size=10`);
      const data = await res.json();
      const newComments = (data.content ?? []).map((c: any) => ({
        id: c.uuid,
        user: c.author.nickname,
        avatar: c.author.profilePictureUrl
          ? `${FULL_BASE_URL}${c.author.profilePictureUrl}`
          : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
        content: c.content,
        time: new Date(c.createdAt).toLocaleString(),
        likes: c.likeCount,
        liked: c.likedByCurrentUser ?? false,
      }));
      setComments(prev => (pageNumber === 0 ? newComments : [...prev, ...newComments]));
      setHasMore(data.content ? !data.last : newComments.length > 0);
    } catch (error) {
      console.error('[❌ Failed to fetch comments]', error);
    }
  };

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [initialPost.uuid]);

  useEffect(() => {
    if (!post?.images?.length) return;
    const loadImageDimensions = async () => {
      const dims = await Promise.all(
        post.images.map(
          (url) =>
            new Promise<{ width: number; height: number }>((resolve) => {
              Image.getSize(url, (w, h) => resolve({ width: w, height: h }), () =>
                resolve({ width: 1, height: 1 })
              );
            })
        )
      );
      setImageDimensions(dims);
    };
    loadImageDimensions();
  }, [post?.images]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPostDetail();
    await fetchComments(0);
    setPage(0);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  const toggleReaction = async (type: 'LIKE' | 'COLLECT') => {
    if (!profileData?.uuid) {
      console.warn('未登录，无法执行操作');
      return;
    }
    try {
      const res = await fetch(`${FULL_BASE_URL}/api/posts/${initialPost.uuid}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userUuid: profileData.uuid }),
      });
      const data = await res.json();
      console.log('[📥 Reaction Toggled, refreshed post]', data);

      setPost({
        uuid: data.uuid,
        title: data.title,
        content: data.content,
        images: (data.images ?? []).map((img: { url: string }) =>
          img.url.startsWith('http') ? img.url : `${FULL_BASE_URL}${img.url}`
        ),
        author: data.author?.nickname ?? '未知用户',
        authorAvatar: data.author?.profilePictureUrl
          ? `${FULL_BASE_URL}${data.author.profilePictureUrl}`
          : 'https://via.placeholder.com/200x200.png?text=No+Avatar',
        likeCount: data.likeCount ?? 0,
        collectCount: data.collectCount ?? 0,
        commentCount: data.commentCount ?? 0,
        likedByMe: data.likedByMe ?? false,
        collectedByMe: data.collectedByMe ?? false,
      });
      setIsLiked(data.likedByMe ?? false);
      setIsCollected(data.collectedByMe ?? false);
    } catch (error) {
      console.error(`[❌ Failed to toggle ${type}]`, error);
    }
  };

  const scrollToComments = () => {
    scrollViewRef.current?.scrollToOffset({ offset: commentY, animated: true });
  };

  if (loading || !post) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#d81e06" />
        <Text style={{ marginTop: 12, color: '#666' }}>加载帖子详情中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        ref={scrollViewRef}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} />
              </TouchableOpacity>
              <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
              <Text style={styles.authorName}>{post.author}</Text>
              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followText}>关注</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={post.images}
              keyExtractor={(_, idx) => String(idx)}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Image
                  source={{ uri: item }}
                  style={[
                    styles.image,
                    { height: (imageDimensions[index]?.height ?? width) / (imageDimensions[index]?.width ?? 1) * width }
                  ]}
                  resizeMode="contain"
                />
              )}
            />
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.body}>{post.content || '暂无内容'}</Text>
            </View>
            <View onLayout={e => setCommentY(e.nativeEvent.layout.y)} style={styles.commentHeader}>
              <Text style={styles.commentHeaderText}>全部评论</Text>
              <View style={styles.commentTabs}>
                {(['最新', '最热'] as SortType[]).map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setActiveSort(type)}
                    style={[styles.commentTab, activeSort === type && styles.activeCommentTab]}
                  >
                    <Text style={[styles.commentTabText, activeSort === type && styles.activeCommentTabText]}>{type}</Text>
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
            <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentUser}>{item.user}</Text>
                <TouchableOpacity style={styles.likeButton}>
                  <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={16} color={item.liked ? '#f33' : '#888'} />
                  <Text style={[styles.commentLikes, item.liked && { color: '#f33' }]}>{item.likes}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.commentContent}>{item.content}</Text>
              <Text style={styles.commentTime}>{item.time}</Text>
            </View>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.commentInput} onPress={() => setShowCommentModal(true)}>
          <Ionicons name="pencil-outline" size={16} color="#888" />
          <Text style={styles.commentText}>说点什么…</Text>
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => toggleReaction('LIKE')}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#f33' : '#888'} />
            <Text style={[styles.count, isLiked && { color: '#f33' }]}>{post.likeCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => toggleReaction('COLLECT')}>
            <Ionicons name={isCollected ? 'star' : 'star-outline'} size={22} color={isCollected ? '#fc0' : '#888'} />
            <Text style={[styles.count, isCollected && { color: '#fc0' }]}>{post.collectCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={scrollToComments}>
            <Ionicons name="chatbubble-outline" size={22} />
            <Text style={styles.count}>{post.commentCount ?? 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

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
              style={[styles.submitButton, !commentText.trim() && styles.disabledButton]}
              onPress={async () => {
                if (!commentText.trim()) return;
                try {
                  const payload = {
                    content: commentText.trim(),
                    authorUuid: profileData?.uuid ?? null,
                  };
                  const res = await fetch(`${FULL_BASE_URL}/api/posts/${initialPost.uuid}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  const newComment: CommentType = {
                    id: data.uuid,
                    user: data.author?.nickname ?? '未知用户',
                    avatar: data.author?.profilePictureUrl
                      ? `${FULL_BASE_URL}${data.author.profilePictureUrl}`
                      : 'https://via.placeholder.com/100x100.png?text=No+Avatar',
                    content: data.content,
                    time: new Date(data.createdAt).toLocaleString(),
                    likes: 0,
                    liked: false,
                  };
                  setComments(prev => [newComment, ...prev]);
                  setCommentText('');
                  setShowCommentModal(false);
                  setPost(prev => prev ? { ...prev, commentCount: (prev.commentCount ?? 0) + 1 } : prev);
                } catch (error) {
                  console.error('[❌ Failed to add comment]', error);
                }
              }}
              disabled={!commentText.trim()}
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
