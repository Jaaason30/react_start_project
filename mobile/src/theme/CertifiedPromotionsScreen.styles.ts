// src/theme/CertifiedPromotionsScreen.styles.ts
import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const STATUS_BAR = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

export const styles = StyleSheet.create({
  /* root */
  container: { flex: 1, backgroundColor: '#111' },

  /* header */
  headerBar: {
    height: STATUS_BAR + 48,
    paddingTop: STATUS_BAR,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  favBtn: { position: 'absolute', right: 16, bottom: 12 },
backBtn: {
  position: 'absolute',
  left: 16,
  bottom: 12,
  zIndex: 10,
},

  /* segmented control */
  segmentWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 8,
  },
  tabItemActive: {
    borderColor: 'transparent',
    backgroundColor: '#7b2cff',
  },
  tabText: { color: '#aaa', fontSize: 13 },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  /* list */
  listContent: { paddingHorizontal: 12, paddingVertical: 12 },

  /* card */
  cardOuter: {
    borderRadius: 14,
    marginBottom: 16,
    padding: 1.5, // border thickness via gradient
  },
  cardInner: {
    backgroundColor: '#1b1b1b',
    borderRadius: 12,
    padding: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    marginRight: 12, justifyContent: 'center', alignItems: 'center',
  },
  headerText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
  certBadge: {
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6,
  },
  certBlue: { backgroundColor: '#3f8cff' },
  certPink: { backgroundColor: '#ff5ca3' },
  certText: { color: '#fff', fontSize: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { color: '#ff4db0', fontSize: 12, marginLeft: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  venueTag: {
    backgroundColor: '#333', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 6,
  },
  venueText: { color: '#fff', fontSize: 11 },
  serviceTag: {
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
    marginRight: 6, marginBottom: 6,
  },
  serviceText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
