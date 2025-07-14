// src/screens/PlayerProfileScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { styles } from '../../theme/PlayerProfileScreen.styles';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';

const { width } = Dimensions.get('window');
const FULL_BASE_URL = 'http://10.0.2.2:8080';

const BOTTOM_TABS = [
  { key: 'match',  label: '匹配', icon: 'heart-outline',       screen: 'Dashboard' },
  { key: 'chat',   label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
  { key: 'square', label: '广场', icon: 'apps-outline',        screen: 'Discover' },
  { key: 'me',     label: '我的', icon: 'person-outline',      screen: 'PlayerProfile' },
] as const;
type BottomKey = typeof BOTTOM_TABS[number]['key'];

type RootStackParamList = {
  Dashboard: undefined;
  SeatOverview: undefined;
  Discover: undefined;
  PlayerProfile: { userId?: string };
  PostDetail: { post: any };
  EditProfile: undefined;
};
type NavType   = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PlayerProfile'>;

type PostItem = {
  uuid: string;
  title?: string;
  createdAt: string;
  images?: { url: string }[];
  coverUrl?: string;
  likeCount?: number;
};

export default function PlayerProfileScreen() {
  const navigation = useNavigation<NavType>();
  const route      = useRoute<RouteType>();
  const { profileData, avatarVersion } = useUserProfile();

  const [userData,     setUserData]     = useState<any | null>(null);
  const [posts,        setPosts]        = useState<PostItem[]>([]);
  const [activeBottom, setActiveBottom] = useState<BottomKey>('me');
  const [isLoading,    setIsLoading]    = useState<boolean>(true);
  const [error,        setError]        = useState<string | null>(null);

  // 是否允许编辑
  const canEdit: boolean = route.params?.userId
    ? route.params.userId === profileData?.uuid
    : true;
  const disabledEdit: boolean = !canEdit;

  useEffect(() => {
    const uuid = route.params?.userId ?? profileData?.uuid;
    if (!uuid) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 拉取用户资料
        const profileResponse = await apiClient.get<any>(
          `${API_ENDPOINTS.USER_PROFILE}?userUuid=${uuid}`
        );
        if (profileResponse.error) {
          setError(profileResponse.error);
        } else if (profileResponse.data) {
          setUserData(profileResponse.data);
        }

        // 拉取用户帖子
        const postsResponse = await apiClient.get<{ content: PostItem[] }>(
          `${API_ENDPOINTS.POSTS_BY_AUTHOR.replace(':authorUuid', uuid)}?page=0&size=20`
        );
        if (postsResponse.data) {
          setPosts(postsResponse.data.content || []);
        }
      } catch (err) {
        setError('加载失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [route.params?.userId, profileData?.uuid, avatarVersion]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: '#666', marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#333' }}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: '#666' }}>暂无用户信息</Text>
      </SafeAreaView>
    );
  }

  // 构造头像 URI（带版本号）
  const avatarBase = userData.profilePictureUrl
    ? `${FULL_BASE_URL}${userData.profilePictureUrl}`
    : 'https://via.placeholder.com/200x200.png?text=No+Avatar';
  const avatarUri = `${avatarBase}?v=${avatarVersion}`;

  const renderPost = ({ item }: { item: PostItem }) => {
    const coverUri = item.coverUrl
      ? (item.coverUrl.startsWith('http')
          ? item.coverUrl
          : FULL_BASE_URL + item.coverUrl)
      : item.images && item.images.length > 0
      ? (item.images[0].url.startsWith('http')
          ? item.images[0].url
          : FULL_BASE_URL + item.images[0].url)
      : 'https://via.placeholder.com/400x600.png?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('PostDetail', { post: { ...item, coverUri } })
        }
      >
        <FastImage
          source={{ uri: coverUri }}
          style={styles.cardImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title ?? '（无标题）'}
        </Text>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>
          {route.params?.userId && route.params.userId !== profileData?.uuid
            ? '用户资料'
            : '我的资料'}
        </Text>
        {canEdit && (
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="settings-outline" size={24} color="#222" />
          </TouchableOpacity>
        )}
      </View>

      {/* 头像 & 基本信息 */}
      <View style={styles.identitySection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          disabled={disabledEdit}
        >
          <FastImage
            source={{ uri: avatarUri }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.albumScroll}
        >
          {userData.albumUrls.map((uri: string, idx: number) => {
            const base = uri.startsWith('http') ? uri : FULL_BASE_URL + uri;
            return (
              <FastImage
                key={idx}
                source={{ uri: `${base}?v=${avatarVersion}` }}
                style={styles.albumImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            );
          })}
        </ScrollView>
      )}

      {/* 帖子列表 */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.uuid}
        renderItem={renderPost}
        contentContainerStyle={styles.postListContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无帖子</Text>
          </View>
        }
      />

      {/* 底部导航 */}
      <View style={styles.bottomNav}>
        {BOTTOM_TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              setActiveBottom(t.key);
              if (t.screen !== 'PlayerProfile') {
                navigation.navigate(t.screen as any);
              }
            }}
            style={styles.navItem}
          >
            <Ionicons
              name={t.icon}
              size={24}
              color={activeBottom === t.key ? '#d81e06' : '#222'}
            />
            <Text
              style={[
                styles.navLabel,
                activeBottom === t.key && styles.navLabelActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
