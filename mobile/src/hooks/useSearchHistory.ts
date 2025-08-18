// src/hooks/useSearchHistory.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistoryItem {
  keyword: string;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 20;
const STORAGE_KEY_PREFIX = '@zusa_search_history_';

export const useSearchHistory = (userId?: string) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 生成用户专属的存储键
  const getStorageKey = useCallback(() => {
    if (!userId) {
      console.warn('[useSearchHistory] No userId provided, search history will not be saved');
      return null;
    }
    return `${STORAGE_KEY_PREFIX}${userId}`;
  }, [userId]);

  // 从本地存储加载搜索历史
  const loadHistory = useCallback(async () => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsedHistory: SearchHistoryItem[] = JSON.parse(stored);
        // 按时间倒序排列（最新的在前面）
        const sortedHistory = parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sortedHistory);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('[useSearchHistory] Error loading search history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [getStorageKey]);

  // 保存搜索历史到本地存储
  const saveHistory = useCallback(async (newHistory: SearchHistoryItem[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) {return;}

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('[useSearchHistory] Error saving search history:', error);
    }
  }, [getStorageKey]);

  // 添加搜索记录
  const addHistory = useCallback(async (keyword: string) => {
    if (!keyword || !keyword.trim()) {
      console.warn('[useSearchHistory] Cannot add empty keyword to history');
      return;
    }

    const trimmedKeyword = keyword.trim();
    const timestamp = Date.now();

    setHistory(prevHistory => {
      // 移除已存在的相同关键词
      const filteredHistory = prevHistory.filter(item => item.keyword !== trimmedKeyword);

      // 添加新记录到最前面
      const newHistory = [
        { keyword: trimmedKeyword, timestamp },
        ...filteredHistory,
      ];

      // 限制最大数量
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);

      // 异步保存到存储
      saveHistory(limitedHistory);

      return limitedHistory;
    });
  }, [saveHistory]);

  // 删除单条搜索记录
  const deleteHistory = useCallback(async (keyword: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.keyword !== keyword);

      // 异步保存到存储
      saveHistory(newHistory);

      return newHistory;
    });
  }, [saveHistory]);

  // 清空所有搜索历史
  const clearHistory = useCallback(async () => {
    setHistory([]);

    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        await AsyncStorage.removeItem(storageKey);
      } catch (error) {
        console.error('[useSearchHistory] Error clearing search history:', error);
      }
    }
  }, [getStorageKey]);

  // 用户ID变化时重新加载历史
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    addHistory,
    deleteHistory,
    clearHistory,
    reloadHistory: loadHistory,
  };
};

export default useSearchHistory;
