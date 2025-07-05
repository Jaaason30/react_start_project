import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 32 - 12) / 3;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  scrollContainer: {
    flex: 0,
  },
  postGridContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  identityText: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
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
  albumScroll: {
    paddingHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  albumItem: {
    marginRight: 12,
  },
  albumImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#888',
  },
  bioContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  bio: {
    color: '#333',
    fontSize: 13,
    lineHeight: 18,
  },
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
  debugUrl: {
    fontSize: 10,
    color: '#aaa',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
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
  postListContainer: {
    paddingBottom: 72,
    backgroundColor: '#fff',
  },
});
