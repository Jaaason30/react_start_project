// src/screens/SearchScreen.tsx

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
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { patchUrl } from './utils/urlHelpers';


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
const HOT_TAG_LIMIT = 12;

export default function SearchScreen() {
  const navigation = useNavigation<SearchNav>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotTags, setHotTags] = useState<TagItem[]>([]);
  const [showTags, setShowTags] = useState(true);

  /* ------------- 拉取热门标签 ------------- */
  useEffect(() => {
    (async () => {
      console.log('[SearchScreen] fetching hot tags…');
      try {
        const { data: tags, status, error } = await apiClient.get<TagItem[]>(
          `${API_ENDPOINTS.TAGS_HOT}?limit=${HOT_TAG_LIMIT}`
        );
        console.log('[SearchScreen] hot tags status:', status, 'error:', error, 'payload:', tags);
        if (status === 200 && Array.isArray(tags)) {
          setHotTags(tags);
        } else {
          console.warn('[SearchScreen] unable to fetch hot tags:', error);
        }
      } catch (err) {
        console.error('[SearchScreen] fetch hot tags error:', err);
      }
    })();
  }, []);

  /* ------------- 搜索函数 ------------- */
  const handleSearch = useCallback(
    async (kw?: string, hideTags = false) => {
      const keyword = (kw ?? query).trim();
      if (!keyword) {
        console.warn('[SearchScreen] empty keyword, aborting search');
        return;
      }

      if (hideTags) setShowTags(false);
      setLoading(true);
      setResults([]);

      const endpoint =
        `${API_ENDPOINTS.POSTS_SEARCH}` +
        `?kw=${encodeURIComponent(keyword)}` +
        `&shortId=${encodeURIComponent(keyword)}`;
      console.log('[SearchScreen] calling search endpoint →', endpoint);

      try {
        const { data: page, status, error } = await apiClient.get<{
          content: SearchResult[];
        }>(endpoint);
        console.log('[SearchScreen] search status:', status, 'error:', error, 'payload:', page);
        if (status === 200 && page && Array.isArray(page.content)) {
          setResults(page.content);
        } else {
          console.warn('[SearchScreen] search failed:', error);
        }
      } catch (err) {
        console.error('[SearchScreen] handleSearch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const onTagPress = (tag: TagItem) => {
    setQuery(tag.name);
    handleSearch(tag.name, true);
  };

  const renderPost = ({ item }: { item: SearchResult }) => {
    const coverUri = patchUrl(item.coverUrl) ?? '';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('PostDetail', { post: { uuid: item.uuid } })
        }
      >
        <FastImage source={{ uri: coverUri }} style={styles.cardImage} resizeMode="cover" />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title || '（无标题）'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>{item.author.nickname}</Text>
          <View style={styles.likesRow}>
            <Ionicons name="heart-outline" size={14} />
            <Text style={styles.likesText}>{item.likeCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
            onSubmitEditing={() => handleSearch(undefined, true)}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity onPress={() => handleSearch(undefined, true)}>
          <Text style={styles.searchButton}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* Hot Tags */}
      {showTags && hotTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagContainer}
        >
          {hotTags.map((tag) => (
            <TouchableOpacity
              key={tag.name}
              style={styles.tag}
              onPress={() => onTagPress(tag)}
            >
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
    height: 40,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 6,
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
