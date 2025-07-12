import { Alert } from 'react-native';

export const handleApiError = (error: string | null, defaultMessage = '操作失败') => {
  if (error) {
    if (error.includes('Network')) {
      Alert.alert('网络错误', '请检查您的网络连接');
    } else if (error.includes('401') || error.includes('Unauthorized')) {
      Alert.alert('认证失败', '请重新登录');
    } else {
      Alert.alert('错误', error);
    }
  } else {
    Alert.alert('错误', defaultMessage);
  }
};