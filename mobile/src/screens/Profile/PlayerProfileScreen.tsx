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
import { API_ENDPOINTS, BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Dashboard: undefined;
  SeatOverview: undefined;
  Discover: undefined;
  PlayerProfile: { shortId?: number; userId?: string };
  PostDetail: { post: any };
  EditProfile: undefined;
};
type NavType = NativeStackNavigationProp<RootStackParamList>;
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
  const route = useRoute<RouteType>();
  const { profileData, avatarVersion } = useUserProfile();

  const [userData, setUserData] = useState<any | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 确定资料拉取方式：shortId 用于其它数据，posts 始终用 UUID
  const targetShortId = route.params?.shortId;
  const authorUuid = route.params?.userId ?? profileData?.uuid;
  const isOwnProfile = !targetShortId || targetShortId === profileData?.shortId;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // —— 拉用户资料 —— (shortId or JWT)
        const profileRes = isOwnProfile
          ? await apiClient.get<any>(API_ENDPOINTS.USER_ME)
          : await apiClient.get<any>(
              `${API_ENDPOINTS.USER_BY_SHORT_ID}/${targetShortId}`
            );

        if (profileRes.error) {
          setError(profileRes.error);
          return;
        }
        setUserData(profileRes.data);

        // —— 拉帖子列表 —— 始终使用 UUID
        const postsRes = await apiClient.get<{ content: PostItem[] }>(
          `${API_ENDPOINTS.POSTS_BY_AUTHOR.replace(
            ':authorUuid',
            authorUuid!
          )}?page=0&size=20`
        );
        if (postsRes.error) {
          console.warn('Load posts error:', postsRes.error);
        } else {
          setPosts(postsRes.data?.content || []);
        }
      } catch (err: any) {
        setError(err.message || '加载失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    if (authorUuid !== undefined) {
      fetchData();
    }
  }, [
    route.params?.shortId,
    route.params?.userId,
    profileData?.shortId,
    profileData?.uuid,
    avatarVersion,
  ]);

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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>暂无用户信息</Text>
      </SafeAreaView>
    );
  }

  const avatarUri = userData.profilePictureUrl
    ? `${BASE_URL}${userData.profilePictureUrl}?v=${avatarVersion}`
    : 'https://via.placeholder.com/200x200.png?text=No+Avatar';

  const renderPost = ({ item }: { item: PostItem }) => {
    const coverUri = item.coverUrl
      ? (item.coverUrl.startsWith('http') ? item.coverUrl : BASE_URL + item.coverUrl)
      : item.images?.[0]?.url
      ? (item.images![0].url.startsWith('http')
          ? item.images![0].url
          : BASE_URL + item.images![0].url)
      : 'https://via.placeholder.com/400x600.png?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PostDetail', { post: { ...item, coverUri } })}
      >
        <FastImage source={{ uri: coverUri }} style={styles.cardImage} resizeMode="cover" />
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
        <Text style={styles.headerTitle}>{isOwnProfile ? '我的资料' : '用户资料'}</Text>
        {isOwnProfile && (
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="settings-outline" size={24} color="#222" />
          </TouchableOpacity>
        )}
      </View>

      {/* 头像 & 基本信息 */}
      <View style={styles.identitySection}>
        <FastImage source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
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
          {userData.albumUrls.map((uri: string, idx: number) => {
            const base = uri.startsWith('http') ? uri : BASE_URL + uri;
            return (
              <FastImage
                key={idx}
                source={{ uri: `${base}?v=${avatarVersion}` }}
                style={styles.albumImage}
                resizeMode="cover"
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
    </SafeAreaView>
  );
}
