import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  backWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 6,
    borderRadius: 22,
    zIndex: 10,
  },
  label: {
    color: '#fff',
    marginTop: 18,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
    loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',   // 与 container 同背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#ff2d55',
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 6,
  },
  disabledButton: { backgroundColor: '#555' },
  // 添加到 Step3Screen.styles.ts 文件中的新样式
  datePickerContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  
  // 日期选择按钮
  datePickerButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  
  // 日期选择按钮文字
  datePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  
  // 占位符文字样式
  placeholderText: {
    color: '#888',
  },
  
  // 选中日期显示
  selectedDateText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  
  // Modal 遮罩
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  // 选择器容器
  pickerContainer: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  
  // 选择器头部
  pickerHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  
  // 取消按钮
  pickerCancel: {
    color: '#888',
    fontSize: 16,
  },
  
  // 选择器标题
  pickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  
  // 确定按钮
  pickerConfirm: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  
  // 选择器列表
  pickerList: {
    maxHeight: 300,
  },
  
  // 选择器选项
  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  
  // 选择器选项文字
  pickerItemText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center' as const,
  },
});

