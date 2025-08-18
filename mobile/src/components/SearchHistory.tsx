// src/components/SearchHistory.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SearchHistoryItem } from '../hooks/useSearchHistory';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onItemPress: (keyword: string) => void;
  onItemDelete: (keyword: string) => void;
  onClear: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onItemPress,
  onItemDelete,
  onClear,
}) => {
  // 确认清空历史
  const handleClearConfirm = () => {
    Alert.alert(
      '清空搜索历史',
      '确定要清空所有搜索历史吗？此操作无法撤销。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '清空',
          style: 'destructive',
          onPress: onClear,
        },
      ]
    );
  };

  // 确认删除单条记录
  const handleDeleteItem = (keyword: string) => {
    Alert.alert(
      '删除搜索记录',
      `确定要删除 "${keyword}" 吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => onItemDelete(keyword),
        },
      ]
    );
  };

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>暂无搜索历史</Text>
        <Text style={styles.emptySubText}>开始搜索来建立历史记录</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.title}>搜索历史</Text>
        </View>
        <TouchableOpacity onPress={handleClearConfirm} style={styles.clearButton}>
          <Text style={styles.clearText}>清空</Text>
        </TouchableOpacity>
      </View>

      {/* 历史记录列表 */}
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        <View style={styles.tagsContainer}>
          {history.map((item, index) => (
            <View key={`${item.keyword}-${index}`} style={styles.tagWrapper}>
              <TouchableOpacity
                style={styles.tag}
                onPress={() => onItemPress(item.keyword)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText} numberOfLines={1}>
                  {item.keyword}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteItem(item.keyword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={12} color="#999" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#ff4757',
  },
  listContainer: {
    flexGrow: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagWrapper: {
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  tag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    paddingRight: 24, // 为删除按钮留出空间
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxWidth: 150,
  },
  tagText: {
    fontSize: 14,
    color: '#495057',
  },
  deleteButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
});

export default SearchHistory;
