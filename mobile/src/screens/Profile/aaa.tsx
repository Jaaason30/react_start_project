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

  const [userData,     setUserData]     = useState<any|null>(null);
  const [posts,        setPosts]        = useState<PostItem[]>([]);
  const [activeBottom, setActiveBottom] = useState<BottomKey>('me');

  // 只给头像和相册加版本号
  const withVersion = (url: string) => `${url}?v=${avatarVersion}`;

  useEffect(() => {
    const uuid = route.params?.userId ?? profileData?.uuid;
    if (!uuid) return;

    // 拉取用户资料
    (async () => {
      try {
        const resp = await fetch(`${FULL_BASE_URL}/api/user/profile?userUuid=${uuid}`);
        const data = await resp.json();
        setUserData(data);
      } catch (err) {
        console.error('[FetchProfile]', err);
      }
    })();

    // 拉取用户帖子
    (async () => {
      try {
        const resp = await fetch(
          `${FULL_BASE_URL}/api/posts/user/${uuid}?page=0&size=20`,
          { credentials: 'include' }
        );
        const data = await resp.json();
        setPosts(data.content || []);
      } catch (err) {
        console.error('[FetchPosts]', err);
      }
    })();
  }, [route.params?.userId, profileData?.uuid, avatarVersion]);

  if (userData === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // 构造头像 URI（带版本号）
  const avatarBase = userData.profilePictureUrl
    ? `${FULL_BASE_URL}${userData.profilePictureUrl}`
    : 'https://via.placeholder.com/200x200.png?text=No+Avatar';
  const avatarUri = withVersion(avatarBase);

  // 渲染帖子卡片
  const renderPost = ({ item }: { item: PostItem }) => {
    // 不给 coverUrl 加版本号，保持原始链接
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
          navigation.navigate('PostDetail', {
            post: { ...item, coverUrl: coverUri },
          })
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
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>我的资料</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="settings-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* 头像 + 基本信息 */}
      <View style={styles.identitySection}>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <FastImage
            source={{ uri: avatarUri }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <View style={styles.identityText}>
          <Text style={styles.username}>{userData.nickname}</Text>
          <Text style={styles.userId}>
            ID: {userData.shortId ?? '未设置'}
          </Text>
        </View>
      </View>

      {/* 粉丝/关注统计 */}
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

      {/* 相册预览（带版本号） */}
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
                source={{ uri: withVersion(base) }}
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
        keyExtractor={item => item.uuid}
        renderItem={renderPost}
        contentContainerStyle={styles.postListContainer}
      />

      {/* 底部导航 */}
      <View style={styles.bottomNav}>
        {BOTTOM_TABS.map(t => (
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
