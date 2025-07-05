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
  { key: 'match', label: '匹配', icon: 'heart-outline', screen: 'Dashboard' },
  { key: 'chat', label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
  { key: 'square', label: '广场', icon: 'apps-outline', screen: 'Discover' },
  { key: 'me', label: '我的', icon: 'person-outline', screen: 'PlayerProfile' },
] as const;

type RootStackParamList = {
  Dashboard: undefined;
  SeatOverview: undefined;
  Discover: undefined;
  PlayerProfile: { userId?: string };
  PostDetail: { post: any };
  EditProfile: undefined;
};

type NavType = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PlayerProfile'>;

type PostItem = {
  uuid: string;
  title: string;
  createdAt: string;
  images?: { url: string }[];
  coverUrl?: string;
  likeCount?: number;
};

export default function PlayerProfileScreen() {
  const navigation = useNavigation<NavType>();
  const route = useRoute<RouteType>();
  const { profileData } = useUserProfile();
  const [userData, setUserData] = useState<any | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeBottom, setActiveBottom] = useState<typeof BOTTOM_TABS[number]['key']>('me');

  useEffect(() => {
    const uuid = route.params?.userId ?? profileData?.uuid;
    if (!uuid) return;

    const fetchProfile = async () => {
      try {
        const resp = await fetch(`${FULL_BASE_URL}/api/user/profile?userUuid=${uuid}`);
        const data = await resp.json();
        console.log('[FetchProfile]', data);
        setUserData(data);
      } catch (err) {
        console.error('[FetchProfile]', err);
      }
    };

    const fetchPosts = async () => {
      try {
        const url = `${FULL_BASE_URL}/api/posts/user/${uuid}?page=0&size=20`;
        const resp = await fetch(url, { credentials: 'include' });
        const data = await resp.json();
        const list: PostItem[] = data.content || [];
        console.log('[FetchPosts]', list);
        setPosts(list);
      } catch (err) {
        console.error('[FetchPosts]', err);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [route.params?.userId, profileData?.uuid]);

  const getFormattedImageUrl = (rawUrl?: string): string => {
    if (!rawUrl) return 'https://via.placeholder.com/400x600.png?text=No+Image';
    return rawUrl.startsWith('http') ? rawUrl : FULL_BASE_URL + rawUrl;
  };

  const renderPost = ({ item }: { item: PostItem }) => {
    const coverUrl = item.coverUrl
      ? getFormattedImageUrl(item.coverUrl)
      : item.images && item.images.length > 0
      ? getFormattedImageUrl(item.images[0].url)
      : 'https://via.placeholder.com/400x600.png?text=No+Image';

    const postWithCover = { ...item, coverUrl };

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PostDetail', { post: postWithCover })}
      >
        <FastImage
          source={{ uri: coverUrl }}
          style={styles.cardImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title ?? '（无标题）'}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>{userData?.nickname || '匿名'}</Text>
          <View style={styles.likesRow}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <Text style={styles.likesText}>{item.likeCount ?? 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (userData === null) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with settings icon */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>我的资料</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="settings-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Identity Section */}
      <View style={styles.identitySection}>
        <TouchableOpacity>
          <FastImage
            source={{
              uri: userData.profilePictureUrl
                ? FULL_BASE_URL + userData.profilePictureUrl
                : 'https://via.placeholder.com/200x200.png?text=No+Avatar'
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.identityText}>
          <Text style={styles.username}>{userData.nickname}</Text>
          <Text style={styles.userId}>ID: {userData.shortId ?? '未设置'}</Text>
        </View>
      </View>

      {/* Stats Row */}
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

      {/* Album Preview */}
      {Array.isArray(userData.albumUrls) && userData.albumUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumScroll}>
          {userData.albumUrls.map((uri: string, idx: number) => (
            <TouchableOpacity key={idx} style={styles.albumItem}>
              <FastImage
                source={{ uri: FULL_BASE_URL + uri }}
                style={styles.albumImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={item => item.uuid}
        renderItem={renderPost}
        contentContainerStyle={styles.postListContainer}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {BOTTOM_TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              setActiveBottom(t.key);
              if (t.screen !== 'PlayerProfile') navigation.navigate(t.screen as any);
            }}
            style={styles.navItem}
          >
            <Ionicons name={t.icon} size={24} color={activeBottom === t.key ? '#d81e06' : '#222'} />
            <Text style={[styles.navLabel, activeBottom === t.key && styles.navLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
