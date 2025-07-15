import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_WIDTH = (width - CARD_GAP * 3) / 2;
const STATUS_BAR = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

const BANNER_H = 140;
const FAB_SIZE = 56;
const FAB_BOTTOM = 30;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: STATUS_BAR + 44,
    paddingTop: STATUS_BAR,
    borderBottomColor: '#eee',
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 3,
  },
  topTabs: {
    position: 'absolute',
    left: 30,
    right: 0,
    top: STATUS_BAR,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  tabTouch: {
    marginRight: 20,
  },
  tabText: {
    fontSize: 16,
    color: '#444',
  },
  tabActive: {
    color: '#d81e06',
    fontWeight: '600',
  },

  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  iconBtn: {
    marginLeft: 16,
    color: '#444',
  },

  bannerBox: {
    position: 'relative',
  },
  banner: {
    width: width,
    height: BANNER_H,
    borderRadius: 8,
  },

  dotsWrap: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#d81e06',
  },

  listContent: {
    paddingHorizontal: CARD_GAP,
    // 增加底部间距，避免 FAB 和底部导航遮挡内容
    paddingBottom: FAB_BOTTOM + FAB_SIZE + 10,
  },

  card: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
    marginRight: CARD_GAP,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
  },
  cardTitle: {
    padding: 6,
    fontSize: 14,
    lineHeight: 18,
    color: '#222',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FAB_SIZE,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLabel: {
    fontSize: 12,
    marginTop: 2,
    color: '#222',
  },
  bottomLabelActive: {
    color: '#d81e06',
    fontWeight: '600',
  },

  verifyWrapper: {
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  verifyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 20,
  },
  verifyText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  crownIcon: {
    marginLeft: 4,
    color: '#fff',
  },

  // 嵌入式方形发帖按钮
  postTabRect: {
    flex: 0,
    width: 64,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#d81e06',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  plus: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 36,
  },

  // 作者头像容器
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },

  // 中央悬浮按钮（FAB）
  fab: {
    position: 'absolute',
    bottom: FAB_BOTTOM,
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#d81e06',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export const constants = {
  STATUS_BAR,
  CARD_WIDTH,
  FAB_SIZE,
  FAB_BOTTOM,
};
