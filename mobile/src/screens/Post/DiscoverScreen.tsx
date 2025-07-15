// src/screens/DiscoverScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Platform,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../theme/DiscoverScreen.styles';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { DiscoverBanner } from './components/DiscoverBanner';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `http://${HOST}:8080`;

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SeatOverview: undefined;
  SeatPage: { seatId: string };
  Discover: undefined;
  Search: undefined;
  PlayerProfile: { userId?: string };
  PostCreation: undefined;
  PostDetail: { post: any };
};

type DiscoverNav = NativeStackNavigationProp<RootStackParamList, 'Discover'>;

const TOP_TABS = ['关注', '推荐'] as const;

const BOTTOM_TABS = [
  { key: 'heart', label: '心动', icon: 'heart-outline', screen: 'Dashboard' },
  { key: 'chat', label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
  { key: 'post', label: '', icon: '', screen: 'PostCreation' },
  { key: 'square', label: '广场', icon: 'apps-outline', screen: 'Discover' },
  { key: 'me', label: '我的', icon: 'person-outline', screen: 'PlayerProfile' },
] as const;

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNav>();
  const [activeTopTab, setActiveTopTab] = useState<typeof TOP_TABS[number]>('推荐');
  const [activeBottom, setActiveBottom] = useState<typeof BOTTOM_TABS[number]['key']>('square');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  const fetchPosts = useCallback(async () => {
    const res = await apiClient.get<{ content: any[] }>(`${API_ENDPOINTS.POSTS_FEED}?page=0&size=20`);
    if (res.error) {
      console.error('[fetchPosts] error:', res.error);
      return;
    }
    // safely handle possible null data
    setPosts(res.data?.content ?? []);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await fetchPosts();
    setLoading(false);
  }, [fetchPosts]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const getCoverUrl = (item: any): string => {
    if (item.coverUrl) {
      return item.coverUrl.startsWith('http') ? item.coverUrl : `${BASE_URL}${item.coverUrl}`;
    }
    if (item.coverImageUrl) {
      return item.coverImageUrl.startsWith('http')
        ? item.coverImageUrl
        : `${BASE_URL}${item.coverImageUrl}`;
    }
    if (Array.isArray(item.images) && item.images.length) {
      const first = item.images[0];
      if (first.url) return first.url.startsWith('http') ? first.url : `${BASE_URL}${first.url}`;
      if (first.path) return `${BASE_URL}${first.path}`;
      if (first.uuid) return `${BASE_URL}/api/media/photo/${first.uuid}`;
    }
    return 'https://via.placeholder.com/400x600';
  };

  const PostCard: React.FC<{ item: any }> = ({ item }) => {
    const [uri, setUri] = useState(getCoverUrl(item));
    useEffect(() => setUri(getCoverUrl(item)), [item]);

    const author = item.author;
    const avatarUri = author?.profilePictureUrl
      ? author.profilePictureUrl.startsWith('http')
        ? author.profilePictureUrl
        : `${BASE_URL}${author.profilePictureUrl}`
      : 'https://via.placeholder.com/16';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PostDetail', { post: { ...item, coverUrl: uri } })}
      >
        <FastImage
          source={{ uri }}
          style={styles.cardImage}
          resizeMode={FastImage.resizeMode.cover}
          onError={() => setUri('https://via.placeholder.com/400x600')}
        />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title ?? '（无标题）'}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.authorContainer}>
            <FastImage source={{ uri: avatarUri }} style={styles.authorAvatar} />
            <Text style={styles.author}>{author?.nickname ?? '匿名'}</Text>
          </View>
          <View style={styles.likesRow}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <Text style={styles.likesText}>{item.likeCount ?? 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 顶部导航 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => {}} style={{ marginRight: 16 }}>
          <Ionicons name="menu-outline" size={24} color="#444" />
        </TouchableOpacity>
        <View style={styles.topTabs}>
          {TOP_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTopTab(tab)}
              style={styles.tabTouch}
            >
              <Text style={[styles.tabText, activeTopTab === tab && styles.tabActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
            <Ionicons name="search-outline" size={24} color="#444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 内容区 */}
      {loading ? (
        <ActivityIndicator size="large" color="#d81e06" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={posts}
          keyExtractor={item => item.uuid}
          renderItem={({ item }) => <PostCard item={item} />}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={9}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d81e06" />
          }
          ListHeaderComponent={<DiscoverBanner />}
        />
      )}

      {/* 底部导航栏 */}
      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map(tab => {
          if (tab.key === 'post') {
            return (
              <TouchableOpacity
                key="post"
                style={styles.postTabRect}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PostCreation')}
              >
                <Text style={styles.plus}>+</Text>
              </TouchableOpacity>
            );
          }
          const isActive = activeBottom === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.bottomItem}
              activeOpacity={0.6}
              onPress={() => {
                if (tab.key === 'square') {
                  setActiveBottom(tab.key);
                  // 自动滚到顶部并下拉刷新
                  listRef.current?.scrollToOffset({ offset: 0, animated: true });
                  onRefresh();
                } else {
                  navigation.navigate(tab.screen as any);
                  setActiveBottom(tab.key);
                }
              }}
            >
              <Ionicons name={tab.icon} size={24} color={isActive ? '#d81e06' : '#888'} />
              <Text style={[styles.bottomLabel, isActive && styles.bottomLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

