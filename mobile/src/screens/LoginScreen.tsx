// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { Colors } from '../theme/colors';
import { useUserProfile } from '../contexts/UserProfileContext';
import { RootStackParamList } from '../App';
import tokenManager from '../services/tokenManager';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLoginSuccess?: () => void;
  error?: string;
};

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, error }) => {
  const navigation = useNavigation<any>();
  const { setProfileData, refreshProfile } = useUserProfile();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('错误', '请输入邮箱/昵称和密码');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[LoginScreen] 请求登录接口:', { username, password });

      const { data, error: loginError } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        userUuid: string;
        email: string;
        nickname: string;
      }>(API_ENDPOINTS.LOGIN, { username, password });

      if (loginError) {
        console.log('[LoginScreen] 登录失败 error:', loginError);
        Alert.alert('登录失败', loginError);
        return;
      }

      if (!data) {
        console.log('[LoginScreen] 登录失败，返回空数据');
        Alert.alert('登录失败', '服务器返回空数据');
        return;
      }

      console.log('[LoginScreen] 登录成功，收到数据:', data);

      // 保存 token
      await tokenManager.saveTokens(data.accessToken, data.refreshToken);
      console.log('[LoginScreen] token 已保存');

      // 设置 context 的 uuid（为 refreshProfile 做准备）
      setProfileData((prev) => {
        const next = { ...prev, uuid: data.userUuid };
        console.log('[LoginScreen] setProfileData 设置 uuid:', next);
        return next;
      });

      // 拉取完整用户 profile（刷新 context 数据）
      console.log('[LoginScreen] 即将调用 refreshProfile');
      await refreshProfile();
      console.log('[LoginScreen] refreshProfile 完成');
      onLoginSuccess?.();
      navigation.replace('Step1Screen');
    } catch (err: any) {
      console.error('[LoginScreen] 登录失败:', err);
      Alert.alert('网络错误', '无法连接到服务器');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>登录</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          placeholder="邮箱或昵称"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          placeholder="密码"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={styles.buttonText}>登录</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <Text style={styles.link}>没有账号？去注册</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: 300,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 5,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: Colors.primary,
    marginTop: 10,
    textAlign: 'center',
  },
});
