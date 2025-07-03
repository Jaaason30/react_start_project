import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const GRID_GAP   = 8;
const CARD_SIZE  = (width - GRID_GAP * 3) / 2;

/* 横向照片墙尺寸 */
const PHOTO_HEIGHT      = 160;
const PHOTO_V_PADDING   = 12;
const PHOTO_WRAPPER_H   = PHOTO_HEIGHT + PHOTO_V_PADDING * 2;

export const styles = StyleSheet.create({
  /* ===== 基础 ===== */
  container: { flex: 1, backgroundColor: '#000' },

  /* ===== 顶部栏 ===== */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#111',
  },

  /* ===== 资料区 ===== */
  profileHeader: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#ff00cc' },
  nickname: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginTop: 8 },
  userId: { color: '#aaa', fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: {
    color: '#0ff',
    fontSize: 12,
    backgroundColor: '#222',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bio: { marginTop: 6, color: '#ccc', fontSize: 13 },

  /* ===== 相册（横向照片墙） ===== */
  albumScroll: { paddingHorizontal: 12, marginVertical: 12 },
  photoWrapper: { height: PHOTO_WRAPPER_H, paddingVertical: PHOTO_V_PADDING },
  photoScrollContent: { paddingHorizontal: 12 },
  photoItem: { width: 120, height: PHOTO_HEIGHT, borderRadius: 12, marginRight: 10 },

  /* ===== Tab 栏（如需用） ===== */
  tabBar: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginVertical: 16 },
  tabActive: {
    color: '#ff00cc',
    fontWeight: 'bold',
    fontSize: 16,
    borderBottomWidth: 2,
    borderColor: '#ff00cc',
    paddingBottom: 4,
  },
  tabInactive: { color: '#aaa', fontSize: 16 },

  /* ===== 动态网格（预留） ===== */
  gridItem: { width: CARD_SIZE, backgroundColor: '#111', borderRadius: 10, overflow: 'hidden' },
  gridImage: { width: '100%', height: CARD_SIZE },
  gridText: { color: '#fff', fontSize: 12, padding: 6 },

  /* ===== 帖子列表 ===== */
  postListContainer: { paddingBottom: 72 },
  emptyListText: { textAlign: 'center', color: '#888', marginTop: 32 },
  postCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#111',
    borderRadius: 10,
    overflow: 'hidden',
  },
  postCover: { width: '100%', height: 200 },
  postInfo: { padding: 12 },
  postTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  postTime: { color: '#888', marginTop: 4, fontSize: 12 },
  badgeOngoing: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#555',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeHot: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f33',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 12 },

  /* ===== 底部导航栏 ===== */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomItem: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 4 },
  bottomLabel: { fontSize: 12, color: '#222' },
  bottomLabelActive: { color: '#d81e06' },

  /* ===== Loading / Error ===== */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
