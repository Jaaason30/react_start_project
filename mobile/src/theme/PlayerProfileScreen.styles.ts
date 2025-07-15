// src/theme/PlayerProfileScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 32 - 12) / 3;

export const styles = StyleSheet.create({
  // 整体容器
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // 顶部返回按钮（用于错误页面的“返回”）
  backButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 4,
  },

  // 顶部栏
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  // 加载态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  // “暂无帖子” 空白态
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },

  // “身份” 区块：头像 + 昵称 + ID
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  identityText: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  userId: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },

  // 粉丝 / 关注 统计
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },

  // 相册横向滚动
  albumScroll: {
    paddingHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  albumImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 12,
  },

  // 帖子列表容器
  postListContainer: {
    paddingBottom: 72,
    backgroundColor: '#fff',
  },

  // 帖子卡片
  card: {
    margin: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  author: {
    fontSize: 12,
    color: '#555',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#888',
  },

  // 底部导航
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#222',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#d81e06',
  },
});
