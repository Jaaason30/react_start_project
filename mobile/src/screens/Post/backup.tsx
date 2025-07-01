// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ListRenderItem,
  ListRenderItemInfo,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';



interface SearchResult {
  id: string;
  title: string;
  source: string;
  date: string;
  likes: number;
  image: string;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const TABS: string[] = ['全部', '用户', '商品', '话题', '地点', '问一问'];

const mockData: SearchResult[] = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i),
  title: `示例标题 ${i + 1}`,
  source: '源名称',
  date: '2025-06-29',
  likes: Math.floor(Math.random() * 100),
  image: `https://picsum.photos/seed/${i}/300/200`,
}));

export default function SearchScreen() {
    const navigation = useNavigation();
  const [query, setQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);

  const clearQuery = () => setQuery('');

  const renderTab: ListRenderItem<string> = ({ item, index }: ListRenderItemInfo<string>) => {
    const isActive = index === activeTab;
    return (
      <TouchableOpacity
        key={item}
        style={styles.tabItem}
        onPress={() => setActiveTab(index)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {item}
        </Text>
        {isActive && <View style={styles.tabUnderline} />}
      </TouchableOpacity>
    );
  };

  const renderCard: ListRenderItem<SearchResult> = ({ item }: ListRenderItemInfo<SearchResult>) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {item.title}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>{item.source}</Text>
          <Text style={styles.footerText}>{item.date}</Text>
          <View style={styles.likeRow}>
            <Ionicons name="heart-outline" size={14} />
            <Text style={styles.footerText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索韭菜炒鸡蛋"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearQuery}>
              <Ionicons name="close-circle" size={16} style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => {/* trigger search */}}>
          <Text style={styles.searchButton}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          horizontal
          keyExtractor={(tab) => tab}
          renderItem={renderTab}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Results Grid */}
      <FlatList<SearchResult>
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 16,
    marginHorizontal: 8,
    paddingHorizontal: 8,
    height: 36,
  },
  searchIcon: { color: '#888' },
  searchInput: {
    flex: 1,
    marginHorizontal: 4,
    fontSize: 14,
    padding: 0,
  },
  clearIcon: { color: '#888' },
  searchButton: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
  },

  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  tabTextActive: {
    color: '#e53935',
  },
  tabUnderline: {
    height: 2,
    backgroundColor: '#e53935',
    width: '100%',
    marginTop: 2,
  },

  grid: {
    padding: CARD_MARGIN / 2,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 4,
    margin: CARD_MARGIN / 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  cardBody: {
    padding: 6,
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
