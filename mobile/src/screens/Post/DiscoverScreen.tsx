// src/screens/DiscoverScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../theme/DiscoverScreen.styles';
import LinearGradient from 'react-native-linear-gradient';

// 🔗 BASE URL
const FULL_BASE_URL = 'http://10.0.2.2:8080';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SeatOverview: undefined;
  SeatPage: { seatId: string };
  Discover: undefined;
  Search: undefined;               // <-- make sure this is in your RootStackParamList
  PlayerProfile: { userId?: string } | undefined;
  PostCreation: undefined;
  CertifiedPromotions: undefined;
  PostDetail: { post: any };
};

type DiscoverNav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const STATUS_BAR = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

type Banner = { id: string; uri: string };
const mockBanners: Banner[] = [
  { id: 'b1', uri: 'https://picsum.photos/800/300' },
  { id: 'b2', uri: 'https://picsum.photos/801/300' },
  { id: 'b3', uri: 'https://picsum.photos/802/300' },
];

const TOP_TABS = ['关注', '推荐', '营销'] as const;
const BOTTOM_TABS = [
  { key: 'match',  label: '匹配', icon: 'heart-outline',       screen: 'Dashboard' },
  { key: 'chat',   label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
  { key: 'square', label: '广场', icon: 'apps-outline',        screen: 'Discover' },
  { key: 'me',     label: '我的', icon: 'person-outline',      screen: 'PlayerProfile' },
] as const;

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNav>();
  const [activeTopTab, setActiveTopTab] = useState<typeof TOP_TABS[number]>('推荐');
  const [activeBottom, setActiveBottom] = useState<typeof BOTTOM_TABS[number]['key']>('square');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${FULL_BASE_URL}/api/posts/feed?page=0&size=20`);
        const data = await res.json();
        setPosts(data.content ?? []);
      } catch (err) {
        console.error('❌ Fetch posts error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderPost = ({ item }: { item: any }) => {
    const coverUrl = item.coverUrl
      ? FULL_BASE_URL + item.coverUrl
      : 'https://via.placeholder.com/400x600';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PostDetail', { post: { ...item, coverUrl } })}
        activeOpacity={0.8}
      >
        <FastImage
          source={{ uri: coverUrl }}
          style={styles.cardImage}
          resizeMode={FastImage.resizeMode.cover}
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
        <Text style={styles.debugUrl} numberOfLines={1}>
          {coverUrl}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 顶部 Tab + 按钮 */}
      <View style={styles.topBar}>
        <View style={styles.topTabs}>
          {TOP_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTopTab(tab)}
              style={styles.tabTouch}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTopTab === tab && styles.tabActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity
            style={styles.verifyWrapper}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CertifiedPromotions')}
          >
            <LinearGradient
              colors={['#FF2E92', '#AF54F5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyTag}
            >
              <Text style={styles.verifyText}>认证营销 👑</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* <-- Search button now navigates to SearchScreen */}
          <Ionicons
            name="search-outline"
            size={24}
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Search')}
          />

          <Ionicons
            name="add-outline"
            size={28}
            style={styles.iconBtn}
            onPress={() => navigation.navigate('PostCreation')}
          />
        </View>
      </View>

      {/* 帖子列表 */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#d81e06"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.uuid}
          renderItem={renderPost}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={9}
          ListHeaderComponent={
            <View style={styles.bannerBox}>
              <ScrollView
                horizontal
                pagingEnabled
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                snapToInterval={width}
                snapToAlignment="center"
                onScroll={({ nativeEvent }) => {
                  const idx = Math.round(nativeEvent.contentOffset.x / width);
                  setBannerIndex(idx);
                }}
                scrollEventThrottle={16}
              >
                {mockBanners.map(b => (
                  <Image
                    key={b.id}
                    source={{ uri: b.uri }}
                    style={styles.banner}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.dotsWrap}>
                {mockBanners.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      bannerIndex === i && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* 底部导航 */}
      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              setActiveBottom(t.key);
              if (t.screen !== 'Discover') navigation.navigate(t.screen as any);
            }}
            style={styles.bottomItem}
          >
            <Ionicons
              name={t.icon}
              size={24}
              color={activeBottom === t.key ? '#d81e06' : '#222'}
            />
            <Text
              style={[
                styles.bottomLabel,
                activeBottom === t.key && styles.bottomLabelActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
