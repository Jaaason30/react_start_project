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
import { DiscoverBanner } from './DiscoverBanner';
import { PostCard } from './Discover/components/PostCard';
import { PostActionSheet } from './Discover/components/PostActionSheet';
import { usePosts } from './Discover/hooks/usePosts';
import { TOP_TABS, BOTTOM_TABS } from './Discover/utils/constants';
import { usePostActions } from './Discover/hooks/usePostActions';
import type { RootStackParamList } from '../../App';
/* ---------- Navigation types ---------- */
type DiscoverNav = NativeStackNavigationProp<RootStackParamList, 'Discover'>;

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNav>();
  const [activeTopTab, setActiveTopTab] = useState<typeof TOP_TABS[number]>('推荐');
  const [activeBottom, setActiveBottom] = useState<typeof BOTTOM_TABS[number]['key']>('square');


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
  const {
    sheetVisible,
    setSheetVisible,
    handleSelectFromGallery,
    handleTakePhoto,
    handleTextPost,
    handleTemplatePost,
  } = usePostActions(handleNewPost);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

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
