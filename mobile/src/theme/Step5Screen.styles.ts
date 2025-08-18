import { StyleSheet, Platform, StatusBar } from 'react-native';

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
    marginBottom: 24,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
  optionDesc: {
    fontSize: 14,
    color: '#888',
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    flexDirection: 'row',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
