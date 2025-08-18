import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '600',
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoBox: {
    marginRight: 10,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#f55',
    borderRadius: 10,
    padding: 2,
  },
  addBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#ff2d55',
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 6,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  backWrapper: {
  position: 'absolute',
  top: 10,
  left: 10,
  padding: 6,
  borderRadius: 22,
  zIndex: 10,
},

});
