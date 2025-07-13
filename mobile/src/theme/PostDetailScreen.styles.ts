import { StyleSheet, StatusBar, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* ---------- 顶部导航 ---------- */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 12 : 12,
    height: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 12 : 12) + 44,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8 },
  authorName: { fontWeight: 'bold', fontSize: 16 },

  /* ---------- 关注 / 取消关注按钮 ---------- */
  followBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#f33',
    borderRadius: 16,
  },
  followText: { color: '#f33', fontSize: 12 },

  unfollowBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  unfollowText: { color: '#888', fontSize: 12 },

  /* ---------- 帖子正文 ---------- */
  image: { width },
  contentContainer: { paddingHorizontal: 12, paddingTop: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 10 },

  /* ---------- 底部操作栏 ---------- */
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
  },
  commentText: { color: '#888', fontSize: 14, marginLeft: 6 },
  rightActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  actionItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  count: { marginLeft: 6, color: '#555', fontSize: 14 },

  /* ---------- 评论列表头 ---------- */
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  commentHeaderText: { fontSize: 16, fontWeight: '600' },
  commentTabs: { flexDirection: 'row' },
  commentTab: { paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  activeCommentTab: { borderBottomWidth: 2, borderBottomColor: '#f33' },
  commentTabText: { fontSize: 14, color: '#666' },
  activeCommentTabText: { color: '#f33', fontWeight: '500' },

  /* ---------- 评论项 ---------- */
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: { fontWeight: 'bold', fontSize: 14 },
  commentContent: { fontSize: 14, marginTop: 2, lineHeight: 20 },
  commentTime: { color: '#999', fontSize: 12, marginTop: 4 },

  /* 兼容旧组件：点赞按钮 & 评论动作容器 */
  likeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  commentLikes: { fontSize: 12, color: '#666', marginLeft: 4, lineHeight: 16 },
  commentActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 },

  /* 新增：评论动作栏 */
  commentActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 2,
  },
  commentActionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },

  /* ---------- 评论输入弹窗 ---------- */
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  commentInputField: {
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#f33',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#f88' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  /* ---------- 回复相关 ---------- */
replyItem: {
  backgroundColor: '#f7f7f7',
  borderLeftWidth: 2,
  borderLeftColor: '#ddd',
  padding: 8,
  marginTop: 8,
  marginLeft: 1, // 👈 让整个回复框向右
  borderRadius: 8,
},
  viewRepliesButton: { marginTop: 8, paddingVertical: 4 },
  viewRepliesText: { color: '#007AFF', fontSize: 13, fontWeight: '500' },
  replyToText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  
  // 回复对象内联显示
  replyToInline: {
    color: '#666',
    fontSize: 13,
    marginLeft: 8,
  },
  
  // 回复内容
  replyContent: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
    lineHeight: 18,
  },
  
  // 回复时间
  replyTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  
  // 回复点赞数
  replyLikes: {
    fontSize: 11,
    color: '#888',
    marginLeft: 3,
  },
});
