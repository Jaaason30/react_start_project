// src/theme/EditProfileScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  // 顶部返回栏
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },

  // Loading 状态全屏居中
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 文本标签与输入框
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },

  // 基础按钮
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },

  // 保存按钮
  saveButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    backgroundColor: '#94d3a2',
  },

  // 头像预览
  imagePreview: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },

  // 相册预览
  albumWrapper: {
    position: 'relative',
    marginRight: 8,
    marginTop: 8,
  },
  albumPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 8,
  },
  addText: {
    fontSize: 30,
    color: '#666',
  },

  // 兴趣 & 场所 标签展示
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2',
    margin: 4,
  },
  optionItemSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  // 相册相关样式
albumScrollView: {
  marginVertical: 10,
},
albumItemWrapper: {
  position: 'relative',
  marginRight: 10,
},

albumRemoveButton: {
  position: 'absolute',
  top: -10,
  right: -10,
  backgroundColor: 'rgba(255, 0, 0, 0.8)',
  borderRadius: 11,
  width: 22,
  height: 22,
  justifyContent: 'center',
  alignItems: 'center',
},
newBadge: {
  position: 'absolute',
  bottom: 4,
  right: 4,
  backgroundColor: '#4CAF50',
  borderRadius: 4,
  paddingHorizontal: 6,
  paddingVertical: 2,
},
newBadgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},
addAlbumButton: {
  width: 100,
  height: 100,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: '#ddd',
  borderStyle: 'dashed',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
},
addAlbumText: {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
},

});
