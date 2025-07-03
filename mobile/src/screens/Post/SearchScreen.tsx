/* src/screens/SearchScreen.tsx
   ------------------------------------------------- */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type SearchNav = NativeStackNavigationProp<RootStackParamList, 'Search'>;

interface SearchResult {
  uuid: string;
  title: string;
  coverUrl: string;
  author: { nickname: string };
  likeCount: number;
}

interface TagItem {
  name: string;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;
const FULL_BASE_URL = 'http://10.0.2.2:8080';
const HOT_TAG_LIMIT = 12;

export default function SearchScreen() {
  const navigation = useNavigation<SearchNav>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotTags, setHotTags] = useState<TagItem[]>([]);
  const [showTags, setShowTags] = useState(true);        // ✅ 新增：是否显示标签栏

  /* ---------------- 拉热门标签 ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${FULL_BASE_URL}/api/tags/hot?limit=${HOT_TAG_LIMIT}`);
        const tags: TagItem[] = await res.json();
        setHotTags(tags);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ---------------- 搜索函数 ---------------- */
const handleSearch = useCallback(
  async (kw?: string, hideTags = false) => {
    const keyword = (kw ?? query).trim();
    if (!keyword) return;

    if (hideTags) setShowTags(false);
    setLoading(true);
    setResults([]);

    // ① 这里多加了 shortId 参数
    const res = await fetch(
      `${FULL_BASE_URL}/api/posts/search?kw=${encodeURIComponent(keyword)}&shortId=${encodeURIComponent(keyword)}`
    );
    const page = await res.json();
    setResults(page.content ?? []);
    setLoading(false);
  },
  [query]
);


  const onTagPress = (tag: TagItem) => {
    setQuery(tag.name);
    handleSearch(tag.name, true);                        // ✅ 点击标签 ⇒ 隐藏标签栏
  };

  const renderPost = ({ item }: { item: SearchResult }) => {
    const cover = item.coverUrl.startsWith('http')
      ? item.coverUrl
      : `${FULL_BASE_URL}${item.coverUrl}`;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PostDetail', { post: { uuid: item.uuid } })}
      >
        <FastImage source={{ uri: cover }} style={styles.cardImage} resizeMode="cover" />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title || '（无标题）'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>{item.author.nickname}</Text>
          <View style={styles.likesRow}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <Text style={styles.likesText}>{item.likeCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------------- 组件渲染 ---------------- */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索帖子"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(undefined, true)}  // ← 输入搜索也可隐藏
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity onPress={() => handleSearch(undefined, true)}>
          <Text style={styles.searchButton}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* Hot Tags */}
      {showTags && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagContainer}
        >
          {hotTags.map((tag) => (
            <TouchableOpacity key={tag.name} style={styles.tag} onPress={() => onTagPress(tag)}>
              <Text style={styles.tagText}>#{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.uuid}
          renderItem={renderPost}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

/* ---------------- 样式 ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    height: 36,
  },
  searchInput: { flex: 1, marginHorizontal: 4, fontSize: 14 },
  searchButton: { fontSize: 16, color: '#333', paddingHorizontal: 8 },

  /* Hot Tags —— 尺寸缩小 */
  tagContainer: {
    height: 40,                          // ✅ 固定高度，避免占满屏
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',                // ✅ 垂直居中
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 6,                // 更紧凑
    paddingVertical: 2,
    marginRight: 6,
  },
  tagText: { fontSize: 12, color: '#555' },

  /* 瀑布流列表 */
  grid: { padding: CARD_MARGIN },
  columnWrapper: { justifyContent: 'space-between' },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginVertical: CARD_MARGIN / 2,
    overflow: 'hidden',
    elevation: 1,
  },
  cardImage: { width: '100%', aspectRatio: 3 / 2 },
  cardTitle: { fontSize: 14, margin: 6, color: '#333' },
  cardFooter: {
    flexDirection: 'row',
    marginHorizontal: 6,
    marginBottom: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: { fontSize: 12, color: '#666' },
  likesRow: { flexDirection: 'row', alignItems: 'center' },
  likesText: { fontSize: 12, color: '#666', marginLeft: 4 },
});
