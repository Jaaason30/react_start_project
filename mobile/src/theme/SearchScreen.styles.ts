// src/screens/SearchScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// 这里的 CARD_MARGIN 要跟 UI 里保持一致
export const CARD_MARGIN = 8;
export const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

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
  searchInput: {
    flex: 1,
    marginHorizontal: 4,
    fontSize: 14,
  },
  searchButton: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
  },

  /* —— hot tags —— */
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CARD_MARGIN / 2,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tag: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
  },

  /* —— grid —— */
  grid: {
    padding: CARD_MARGIN / 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginVertical: CARD_MARGIN / 2,
    overflow: 'hidden',
    elevation: 1,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  cardTitle: {
    fontSize: 14,
    margin: 6,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    marginHorizontal: 6,
    marginBottom: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginLeft: 4,
  },


});
