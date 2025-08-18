import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ListRenderItemInfo,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../../theme/CertifiedPromotionsScreen.styles';
import { useNavigation } from '@react-navigation/native';

const TABS = ['全部', '夜店', 'Homebar'] as const;
type Tab = (typeof TABS)[number];

type Promoter = {
  id: string;
  name: string;
  avatarUrl: string;
  certified: 'blue' | 'pink' | null;
  rating: number;
  reviewCount: number;
  tags: string[];
  servingVenues: string[];
  fansCount: number;
  isOnline: boolean;
  contactMethod: string;
  intro: string;
  gender: 'male' | 'female' | 'other';
  createdAt: Date;
  lastActive: Date;
  isTopPromoter?: boolean;
  favoritedByUsers?: string[];
};

const mockPromoters: Promoter[] = [
  {
    id: 'p1',
    name: '雷神带卡',
    avatarUrl: 'https://i.pravatar.cc/100?img=10',
    certified: 'blue',
    rating: 4.9,
    reviewCount: 120,
    tags: ['#包得吃', '#服务超到位', '#带卡积极'],
    servingVenues: ['Rush', 'Orii'],
    fansCount: 2200,
    isOnline: true,
    contactMethod: 'wechat: thormaster88',
    intro: '速上车，包酒无压力。',
    gender: 'male',
    createdAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'p2',
    name: 'Orii 女皇',
    avatarUrl: 'https://i.pravatar.cc/100?img=20',
    certified: 'pink',
    rating: 4.8,
    reviewCount: 98,
    tags: ['#顶美多', '#顶帅多', '#超雄带卡'],
    servingVenues: ['Orii'],
    fansCount: 1500,
    isOnline: false,
    contactMethod: 'wechat: oriiqueen233',
    intro: '走起，今晚最靓的仔。',
    gender: 'female',
    createdAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'p3',
    name: '西门夜王',
    avatarUrl: 'https://i.pravatar.cc/100?img=30',
    certified: 'blue',
    rating: 4.7,
    reviewCount: 76,
    tags: ['#超会控场', '#性价比高', '#高返卡'],
    servingVenues: ['Echo', 'Glow'],
    fansCount: 1800,
    isOnline: true,
    contactMethod: 'wechat: nightking666',
    intro: '西门人气王，控场稳，回报高。',
    gender: 'male',
    createdAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'p4',
    name: 'Queen Cola',
    avatarUrl: 'https://i.pravatar.cc/100?img=40',
    certified: 'pink',
    rating: 4.6,
    reviewCount: 85,
    tags: ['#带卡积极', '#氛围组长', '#甜妹认证'],
    servingVenues: ['JoyClub'],
    fansCount: 1300,
    isOnline: true,
    contactMethod: 'wechat: colaqueen88',
    intro: '甜妹认证，服务满分，拍照氛围感拉满。',
    gender: 'female',
    createdAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'p5',
    name: '派对导演 Tony',
    avatarUrl: 'https://i.pravatar.cc/100?img=50',
    certified: 'blue',
    rating: 4.5,
    reviewCount: 70,
    tags: ['#节奏大师', '#控酒达人', '#现场炸裂'],
    servingVenues: ['Fever', 'Rush'],
    fansCount: 2000,
    isOnline: false,
    contactMethod: 'wechat: tonyrush',
    intro: '全场节奏都我控，派对导演带你飞。',
    gender: 'male',
    createdAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'p6',
    name: '小熊姐姐',
    avatarUrl: 'https://i.pravatar.cc/100?img=60',
    certified: 'pink',
    rating: 4.9,
    reviewCount: 110,
    tags: ['#颜值天花板', '#贴心带卡', '#顶美多'],
    servingVenues: ['BarX', 'HomeOne'],
    fansCount: 2500,
    isOnline: true,
    contactMethod: 'wechat: bearqueen',
    intro: '小熊姐姐顶美顶甜，主动带卡不踩雷。',
    gender: 'female',
    createdAt: new Date(),
    lastActive: new Date(),
  },
];

export default function CertifiedPromotionsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('全部');
  const flatRef = useRef<FlatList<Promoter>>(null);
  const navigation = useNavigation();

  const filteredData = mockPromoters.filter((p) => {
    if (activeTab === '全部') return true;
    if (activeTab === '夜店') return p.certified === 'blue';
    if (activeTab === 'Homebar') return p.certified === 'pink';
    return false;
  });

  const renderTab = (tab: Tab) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  const renderCard = ({ item }: ListRenderItemInfo<Promoter>) => (
    <LinearGradient
      colors={['#3b1dff', '#ab23ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardOuter}
    >
      <View style={styles.cardInner}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              {!!item.certified && (
                <View
                  style={[
                    styles.certBadge,
                    item.certified === 'blue' ? styles.certBlue : styles.certPink,
                  ]}
                >
                  <Text style={styles.certText}>认证</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingRow}>
              <Text style={{ fontSize: 14, color: '#ff4db0' }}>⭐</Text>
              <Text style={styles.rating}>{item.rating.toFixed(1)} / 5</Text>
            </View>
          </View>
        </View>

        {/* Venue tags */}
        <View style={styles.tagRow}>
          {item.servingVenues.map((v) => (
            <View key={v} style={styles.venueTag}>
              <Text style={styles.venueText}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Custom tags */}
        <View style={styles.tagRow}>
          {item.tags.map((t) => (
            <LinearGradient
              key={t}
              colors={['#ff6b6b', '#ff9e2c']}
              style={styles.serviceTag}
            >
              <Text style={styles.serviceText}>{t}</Text>
            </LinearGradient>
          ))}
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* Header */}
        <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>认证营销</Text>
        <TouchableOpacity style={styles.favBtn} onPress={() => {}}>
            <Ionicons name="heart" size={20} color="#fff" />
        </TouchableOpacity>
        </View>

      {/* Filter tabs */}
      <View style={styles.segmentWrapper}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderTab(item)}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Card list */}
      <FlatList
        ref={flatRef}
        data={filteredData}
        keyExtractor={(p) => p.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollToTop={() =>
          flatRef.current?.scrollToOffset({ offset: 0, animated: true })
        }
      />
    </View>
  );
}
