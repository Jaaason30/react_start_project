// src/screens/DiscoverScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage, { OnLoadEvent } from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../../theme/DiscoverScreen.styles';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { DiscoverBanner } from './components/DiscoverBanner';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `http://${HOST}:8080`;
console.log('[DiscoverScreen] BASE_URL =', BASE_URL);

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
  CertifiedPromotions: undefined;
  PostDetail: { post: any };
};

type DiscoverNav = NativeStackNavigationProp<RootStackParamList, 'Discover'>;
const TOP_TABS = ['关注', '推荐', '营销'] as const;
const BOTTOM_TABS = [
  { key: 'match', label: '匹配', icon: 'heart-outline', screen: 'Dashboard' },
  { key: 'chat', label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
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

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const feedUrl = `${API_ENDPOINTS.POSTS_FEED}?page=0&size=20`;
    console.log('[fetchPosts] GET', feedUrl);
    try {
      const { data, error } = await apiClient.get<{ content: any[] }>(feedUrl);
      if (error) throw new Error(error);
      setPosts(data?.content ?? []);
    } catch (err) {
      console.error('[fetchPosts] error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const getCoverUrl = (item: any): string => {
    let url = '';
    if (item.coverUrl) {
      url = item.coverUrl.startsWith('http') ? item.coverUrl : `${BASE_URL}${item.coverUrl}`;
    } else if (item.coverImageUrl) {
      url = item.coverImageUrl.startsWith('http') ? item.coverImageUrl : `${BASE_URL}${item.coverImageUrl}`;
    } else if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (first.url) url = first.url.startsWith('http') ? first.url : `${BASE_URL}${first.url}`;
      else if (first.path) url = `${BASE_URL}${first.path}`;
      else if (first.uuid) url = `${BASE_URL}/api/media/photo/${first.uuid}`;
    }
    return url || 'https://via.placeholder.com/400x600';
  };

  const PostCard: React.FC<{ item: any }> = ({ item }) => {
    const [uri, setUri] = useState(getCoverUrl(item));
    useEffect(() => {
      setUri(getCoverUrl(item));
    }, [item]);

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
          //onLoad={e => console.log('[FastImage onLoad]', item.uuid, uri, e.nativeEvent)}
        />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title ?? '（无标题）'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>{item.author?.nickname ?? '匿名'}</Text>
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
      <View style={styles.topBar}>
        <View style={styles.topTabs}>
          {TOP_TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTopTab(tab)} style={styles.tabTouch}>
              <Text style={[styles.tabText, activeTopTab === tab && styles.tabActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.verifyWrapper} activeOpacity={0.8} onPress={() => navigation.navigate('CertifiedPromotions')}>
            <LinearGradient colors={['#FF2E92', '#AF54F5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verifyTag}>
              <Text style={styles.verifyText}>认证营销 👑</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Ionicons name="search-outline" size={24} style={styles.iconBtn} onPress={() => navigation.navigate('Search')} />
          <Ionicons name="add-outline" size={28} style={styles.iconBtn} onPress={() => navigation.navigate('PostCreation')} />
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#d81e06" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.uuid}
          renderItem={({ item }) => <PostCard item={item} />}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={9}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={<DiscoverBanner />}
        />
      )}

      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              if (t.screen !== 'Discover') navigation.navigate(t.screen as any);
              setActiveBottom(t.key);
            }}
            style={styles.bottomItem}
          >
            <Ionicons name={t.icon} size={24} color={activeBottom === t.key ? '#d81e06' : '#222'} />
            <Text style={[styles.bottomLabel, activeBottom === t.key && styles.bottomLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
