import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../theme/PlayerProfileScreen.styles';

/* ---------- RootStack 类型 (如有全局声明可移除) ---------- */
export type RootStackParamList = {
  Dashboard: undefined;
  SeatOverview: undefined;
  Discover: undefined;
  PlayerProfile: { userId?: string } | undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const GRID_GAP = 8;
const CARD_SIZE = (width - GRID_GAP * 3) / 2;

const profilePhotos: string[] = [
  'https://picsum.photos/id/1011/200/300',
  'https://picsum.photos/id/1012/200/300',
  'https://picsum.photos/id/1015/200/300',
  'https://picsum.photos/id/1020/200/300',
];

interface Post {
  id: string;
  image: string;
  likes: number;
}
const dynamicPosts: Post[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `post_${i}`,
  image: `https://picsum.photos/id/${100 + i}/400/400`,
  likes: Math.floor(Math.random() * 100),
}));

type BottomKey = 'match' | 'chat' | 'square' | 'me';
const BOTTOM_TABS: {
  key: BottomKey;
  label: string;
  icon: string;
  screen: keyof RootStackParamList;
}[] = [
  { key: 'match',  label: '匹配', icon: 'heart-outline',       screen: 'Dashboard'   },
  { key: 'chat',   label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview'},
  { key: 'square', label: '广场', icon: 'apps-outline',        screen: 'Discover'    },
  { key: 'me',     label: '我的', icon: 'person-outline',      screen: 'PlayerProfile'},
];

export default function PlayerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [activeBottom, setActiveBottom] = useState<BottomKey>('me');

  const handleBottomNavigation = (key: BottomKey, screen: keyof RootStackParamList) => {
    setActiveBottom(key);
    if (screen !== 'PlayerProfile') {
      navigation.navigate(screen as never);
    }
  };

  const handleFetchProfile = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8080/api/user/profile');
      const data = await response.json();
      console.log('[✅ UserDto]', data);
    } catch (err) {
      console.error('❌ 获取用户资料失败:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 测试按钮 */}
      <TouchableOpacity
        onPress={handleFetchProfile}
        style={{
          marginTop: 12,
          padding: 10,
          backgroundColor: '#eee',
          borderRadius: 6,
          alignSelf: 'center',
        }}
      >
        <Text style={{ color: '#333' }}>📡 获取用户资料</Text>
      </TouchableOpacity>

      {/* 玩家信息 */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: 'https://picsum.photos/id/1005/200/200' }} style={styles.avatar} />
        <Text style={styles.nickname}>夜色迷离</Text>
        <Text style={styles.userId}>ID: NIGHT_2024</Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>#电音达人</Text>
          <Text style={styles.tag}>#社牛</Text>
          <Text style={styles.tag}>#Livehouse</Text>
        </View>
        <Text style={styles.bio}>在低频节奏中找回自我</Text>
      </View>

      {/* 横向照片墙 */}
      <View style={styles.photoWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoScrollContent}
        >
          {profilePhotos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.photoItem} />
          ))}
        </ScrollView>
      </View>

      {/* Tab 栏 */}
      <View style={styles.tabBar}>
        <Text style={styles.tabActive}>动态</Text>
        <Text style={styles.tabInactive}>相册</Text>
      </View>

      {/* 动态网格 */}
      <FlatList
        data={dynamicPosts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: GRID_GAP, paddingHorizontal: 12 }}
        contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            <Text style={styles.gridText}>❤️ {item.likes}</Text>
          </View>
        )}
      />

      {/* 底部导航栏 */}
      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map(({ key, label, icon, screen }) => {
          const active = activeBottom === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleBottomNavigation(key, screen)}
              style={styles.bottomItem}
              activeOpacity={0.7}
            >
              <Ionicons name={icon} size={24} color={active ? '#d81e06' : '#222'} />
              <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
