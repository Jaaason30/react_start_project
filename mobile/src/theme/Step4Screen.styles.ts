import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backWrapper: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT + 10,
    left: 16,
    zIndex: 2,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: STATUS_BAR_HEIGHT + 60,
    marginBottom: 16,
    color: '#333',
  },
  certCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  certHint: {
    color: '#999',
    fontSize: 14,
  },
  certImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
