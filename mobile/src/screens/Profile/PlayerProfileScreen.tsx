// src/screens/PlayerProfileScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SeatOverview: undefined;
  SeatPage: { seatId: string };
  Discover: undefined;
  Search: undefined;
  PlayerProfile: { userId?: string };
  PostCreation: undefined;
  CertifiedPromotions: undefined;
  PostDetail: { post: any };
};

type NavType = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PlayerProfile'>;

export default function PlayerProfileScreen() {
  const navigation = useNavigation<NavType>();
  const route = useRoute<RouteType>();
  const { profileData } = useUserProfile();
  const [userData, setUserData] = useState<any>(null);
  const [activeBottom, setActiveBottom] = useState<'match'|'chat'|'square'|'me'>('me');

  useEffect(() => {
    // 优先使用路由传参，其次使用当前登录用户的 shortId
    const shortIdParam = route.params?.userId;
    const shortId = shortIdParam
      ? Number(shortIdParam)
      : profileData.shortId;
    if (!shortId) {
      console.warn('[FetchProfile] No shortId available, skipping fetch.');
      return;
    }

    const fetchProfile = async () => {
      const url = `${FULL_BASE_URL}/api/user/profile?shortId=${shortId}`;
      console.log('[FetchProfile] GET', url);
      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`Status ${resp.status}`);
        }
        const data = await resp.json();
        console.log('[FetchProfile] data:', data);
        setUserData(data);
      } catch (err) {
        console.error('[FetchProfile] failed:', err);
        setUserData(null);
      }
    };

    fetchProfile();
  }, [route.params?.userId, profileData.shortId]);

  // Loading 状态
  if (userData === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 身份/Profile 头部 */}
      <View style={styles.identitySection}>
        <TouchableOpacity>
          <FastImage
            source={{
              uri: userData.profilePictureUrl
                ? FULL_BASE_URL + userData.profilePictureUrl
                : 'https://via.placeholder.com/200x200.png?text=No+Avatar',
            }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.username}>
            {userData.nickname || 'Unnamed User'}
          </Text>
          <TouchableOpacity>
            <Text style={styles.userId}>ID: {userData.shortId}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 粉丝 / 关注 */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>
            {userData.followerCount ?? 0}
          </Text>
          <Text style={styles.statLabel}>粉丝</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>
            {userData.followingCount ?? 0}
          </Text>
          <Text style={styles.statLabel}>关注</Text>
        </TouchableOpacity>
      </View>

      {/* 相册预览 */}
      {Array.isArray(userData.albumUrls) && userData.albumUrls.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16, marginVertical: 12 }}
        >
          {userData.albumUrls.map((uri: string, idx: number) => (
            <TouchableOpacity key={idx} style={{ marginRight: 12 }}>
              <FastImage
                source={{ uri: FULL_BASE_URL + uri }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 简介 */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <Text style={styles.bio}>{userData.bio || 'No bio available.'}</Text>
      </View>

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
                activeBottom === t.key && { color: '#d81e06' },
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
