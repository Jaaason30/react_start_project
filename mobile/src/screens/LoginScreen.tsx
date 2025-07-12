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

console.log('📡 API_ENDPOINTS is', API_ENDPOINTS);

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLoginSuccess?: () => void;
  error?: string;
};

const LoginScreen: React.FC<Props> = ({ onLoginSuccess, error }) => {
  const navigation = useNavigation<any>();
  const { setProfileData } = useUserProfile();

  // allow user to enter email or nickname here
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
      const { data, error: loginError } = await apiClient.post(
        API_ENDPOINTS.LOGIN,
        { username, password }
      );

      if (data && !loginError) {
        // save tokens
        await tokenManager.saveTokens(data.accessToken, data.refreshToken);

        // update user context
        setProfileData((prev) => ({
          ...prev,
          uuid: data.userUuid,
          email: data.email,
          nickname: data.nickname,
        }));

        onLoginSuccess?.();
        navigation.replace('Step1Screen');
      } else {
        Alert.alert('登录失败', loginError || '邮箱/昵称或密码错误');
      }
    } catch (err) {
      console.error('Login error:', err);
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
