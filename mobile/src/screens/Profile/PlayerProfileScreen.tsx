// src/screens/PlayerProfileScreen.tsx
// Modified to use patchProfileUrl / patchUrl for cache-busting URLs

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';

import { useUserProfile } from '../../contexts/UserProfileContext';
import { styles } from '../../theme/PlayerProfileScreen.styles';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { patchProfileUrl, patchUrl } from '../Post/utils/urlHelpers';
import type { RootStackParamList } from '../../App';
/* ---------- 路由类型 ---------- */
type NavType   = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PlayerProfile'>;

/* ---------- 帖子结构 ---------- */
type PostItem = {
  uuid: string;
  title?: string;
  createdAt: string;
  images?: { url: string }[];
  coverUrl?: string;
  likeCount?: number;
};

/* ---------- 底部标签定义 ---------- */
const TAB_ITEMS = [
  { key: 'heart',  label: '心动', icon: 'heart-outline',      screen: 'Dashboard'     },
  { key: 'chat',   label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
  { key: 'square', label: '广场', icon: 'apps-outline',       screen: 'Discover'      },
  { key: 'me',     label: '我的', icon: 'person-outline',     screen: 'PlayerProfile' },
] as const;
type TabKey = typeof TAB_ITEMS[number]['key'];

export default function PlayerProfileScreen() {
  const navigation      = useNavigation<NavType>();
  const route           = useRoute<RouteType>();
  const { avatarVersion } = useUserProfile();

  const [userData,  setUserData]  = useState<any | null>(null);
  const [posts,     setPosts]     = useState<PostItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('square');

  const listRef = useRef<FlatList<PostItem>>(null);
  const handleDeletePost = (uuid: string) => {
    setPosts(prev => prev.filter(p => p.uuid !== uuid));
  };
  /* ---------- 判断角色 ---------- */
  const targetShortId = route.params?.shortId;
  const targetUserId  = route.params?.userId;
  const isOwnProfile  = !targetShortId && !targetUserId;

  /* ---------- 加载数据 ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) 用户资料
        let info: any = null;
        if (isOwnProfile) {
          const r = await apiClient.get(API_ENDPOINTS.USER_ME);
          if (r.error) throw new Error(r.error);
          info = r.data;
        } else if (targetShortId) {
          const r = await apiClient.get(`${API_ENDPOINTS.USER_BY_SHORT_ID}/${targetShortId}`);
          if (r.error) throw new Error(r.error);
          info = r.data;
        }
        if (!info) { setError('无法获取用户信息'); return; }
        setUserData(info);

        // 2) 帖子列表
        let endpoint = '';
        if (info.shortId) {
          endpoint = `${API_ENDPOINTS.POSTS_BY_SHORT_ID}/${info.shortId}?page=0&size=20`;
        } else if (isOwnProfile) {
          endpoint = `${API_ENDPOINTS.POSTS_ME}?page=0&size=20`;
        }
        if (endpoint) {
          const r = await apiClient.get<{ content: PostItem[] }>(endpoint);
          if (!r.error) setPosts(r.data?.content || []);
        } else {
          setPosts([]);
        }
      } catch (e: any) {
        setError(e.message || '加载失败，请重试');
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params?.shortId, route.params?.userId, avatarVersion]);

  /* ---------- 状态渲染 ---------- */
  if (loading) return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
  if (error) return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </SafeAreaView>
  );
  if (!userData) return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={styles.errorText}>暂无用户信息</Text>
    </SafeAreaView>
  );

  /* ---------- 渲染单条帖子 ---------- */
  const renderPost = ({ item }: { item: PostItem }) => {
    const coverUrl = patchUrl(item.coverUrl ?? item.images?.[0]?.url) ||
      'https://via.placeholder.com/400x600.png?text=No+Image';
    const cover = avatarVersion != null ? `${coverUrl}${coverUrl.includes('?') ? '&' : '?'}v=${avatarVersion}` : coverUrl;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
                onPress={() =>
          navigation.navigate('PostDetail', {
            post: { ...item, coverUri: cover } as any,
            onDeleteSuccess: handleDeletePost,
          })
        }
      >
        <FastImage source={{ uri: cover }} style={styles.cardImage} resizeMode="cover" />
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title ?? '（无标题）'}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>{userData.nickname || '匿名'}</Text>
          <View style={styles.likesRow}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <Text style={styles.likesText}>{item.likeCount ?? 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------- 主界面 ---------- */
  // 头像 URL
  const avatarUri =
    patchProfileUrl(userData.profilePictureUrl, avatarVersion) ||
    'https://via.placeholder.com/200x200.png?text=No+Avatar';
    console.log(avatarVersion);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>{isOwnProfile ? '我的资料' : '用户资料'}</Text>
        {isOwnProfile && (
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="settings-outline" size={24} color="#222" />
          </TouchableOpacity>
        )}
      </View>

      {/* 头像 & 基本信息 */}
      <View style={styles.identitySection}>
        <FastImage
          key={`avatar-${avatarVersion}`}
          source={{ uri: avatarUri }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.identityText}>
          <Text style={styles.username}>{userData.nickname}</Text>
          <Text style={styles.userId}>ID: {userData.shortId ?? '未设置'}</Text>
        </View>
      </View>

      {/* 粉丝 / 关注 */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.followerCount ?? 0}</Text>
          <Text style={styles.statLabel}>粉丝</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{userData.followingCount ?? 0}</Text>
          <Text style={styles.statLabel}>关注</Text>
        </TouchableOpacity>
      </View>

      {/* 相册预览 */}
      {Array.isArray(userData.albumUrls) && userData.albumUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumScroll}>
          {userData.albumUrls.map((u: string, i: number) => {
            const mediaUrl = patchUrl(u) || '';
            const uri =
              avatarVersion != null ? `${mediaUrl}${mediaUrl.includes('?') ? '&' : '?'}v=${avatarVersion}` : mediaUrl;
            return (
              <FastImage
                key={i}
                source={{ uri }}
                style={styles.albumImage}
                resizeMode="cover"
              />
            );
          })}
        </ScrollView>
      )}

      {/* 帖子列表 */}
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(it) => it.uuid}
        renderItem={renderPost}
        contentContainerStyle={styles.postListContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无帖子</Text>
          </View>
        }
      />

      {/* 底部导航栏 */}
      <View style={inlineStyles.bottomBar}>
        {TAB_ITEMS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={inlineStyles.bottomItem}
              activeOpacity={0.6}
              onPress={() => {
                if (tab.key === 'me') {
                  listRef.current?.scrollToOffset({ offset: 0, animated: true });
                } else {
                  navigation.navigate(tab.screen);
                }
                setActiveTab(tab.key);
              }}
            >
              <Ionicons
                name={tab.icon}
                size={24}
                color={isActive ? '#d81e06' : '#888'}
              />
              <Text style={[
                inlineStyles.bottomLabel,
                isActive && inlineStyles.bottomLabelActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const inlineStyles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    height: 56,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLabel: {
    fontSize: 12,
    marginTop: 2,
    color: '#888',
  },
  bottomLabelActive: {
    color: '#d81e06',
    fontWeight: 'bold',
  },
});
