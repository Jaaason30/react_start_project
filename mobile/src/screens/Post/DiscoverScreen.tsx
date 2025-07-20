import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../theme/DiscoverScreen.styles';
import { PostType } from '../Post/types';
import { DiscoverBanner } from './DiscoverBanner';
import { PostCard } from './Discover/components/PostCard';
import { PostActionSheet } from './Discover/components/PostActionSheet';
import { usePosts } from './Discover/hooks/usePosts';
import { TOP_TABS, BOTTOM_TABS } from './Discover/utils/constants';
import { selectFromGallery, takePhoto } from './Discover/utils/imagePickerHelpers';

/* ---------- Navigation types ---------- */
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SeatOverview: undefined;
  SeatPage: { seatId: string };
  Discover: undefined;
  Search: undefined;
  PlayerProfile: { shortId?: number; userId?: string };
  PostCreation: {
    source: 'gallery' | 'camera' | 'template' | 'text';
    images?: string[];
    onPostSuccess?: (newPost: PostType) => void;
  };
  WriteText: {  
    source: 'text';
    onPostSuccess?: (newPost: PostType) => void;
  };
  PostDetail: { 
    post: PostType;
    onDeleteSuccess?: (postUuid: string) => void;
  };
  TemplateList: undefined;
};

type DiscoverNav = NativeStackNavigationProp<RootStackParamList, 'Discover'>;

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNav>();
  const [activeTopTab, setActiveTopTab] = useState<typeof TOP_TABS[number]>('推荐');
  const [activeBottom, setActiveBottom] = useState<typeof BOTTOM_TABS[number]['key']>('square');
  const [sheetVisible, setSheetVisible] = useState(false);

  const {
    posts,
    loading,
    refreshing,
    listRef,
    loadInitial,
    onRefresh,
    triggerAutoRefresh,
    handleNewPost,
    handleDeletePost,
  } = usePosts();

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleSelectFromGallery = () => {
    setSheetVisible(false);
    selectFromGallery((images) => {
      navigation.navigate('PostCreation', { 
        source: 'gallery', 
        images,
        onPostSuccess: handleNewPost 
      });
    });
  };

  const handleTakePhoto = () => {
    setSheetVisible(false);
    takePhoto((image) => {
      navigation.navigate('PostCreation', { 
        source: 'camera', 
        images: [image],
        onPostSuccess: handleNewPost,
      });
    });
  };

  const handleTextPost = () => {
    setSheetVisible(false);
    navigation.navigate('WriteText', { 
      source: 'text',
      onPostSuccess: handleNewPost,
    });
  };

  const handleTemplatePost = () => {
    setSheetVisible(false);
    navigation.navigate('PostCreation', { 
      source: 'template',
      onPostSuccess: handleNewPost,
    });
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
          {TOP_TABS.map((tab) => (
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
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <PostCard item={item} onDeleteSuccess={handleDeletePost} />
          )}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={9}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#d81e06"
              colors={['#d81e06']}
              progressViewOffset={50}
            />
          }
          ListHeaderComponent={<DiscoverBanner />}
        />
      )}

      {/* 底部导航栏 */}
      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map((tab) => {
          if (tab.key === 'post') {
            return (
              <TouchableOpacity
                key="post"
                style={styles.postTabRect}
                activeOpacity={0.8}
                onPress={() => setSheetVisible(true)}
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
                  triggerAutoRefresh();
                } else if (tab.key === 'me') {
                  navigation.navigate('PlayerProfile', {} as any);
                  setActiveBottom(tab.key);
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

      {/* 底部弹层 */}
      <PostActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelectGallery={handleSelectFromGallery}
        onTakePhoto={handleTakePhoto}
        onTextPost={handleTextPost}
        onTemplatePost={handleTemplatePost}
      />
    </View>
  );
}
