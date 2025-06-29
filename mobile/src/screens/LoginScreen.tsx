import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useUserProfile } from '../contexts/UserProfileContext';

export default function LoginScreen({ onLoginSuccess, error }: any) {
  const navigation = useNavigation<any>();
  const { setProfileData } = useUserProfile();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // 保存 uuid / email / nickname 到全局上下文
        setProfileData(prev => ({
          ...prev,
          uuid: result.uuid,
          email: result.email,
        }));

        onLoginSuccess?.(username);
        navigation.replace('Step1Screen'); // 登录成功跳转注册流程首页
      } else {
        Alert.alert('登录失败', result.message || '用户名或密码错误');
      }
    } catch (err) {
      Alert.alert('网络错误', '无法连接到服务器');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>登录</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          placeholder="用户名"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="密码"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>登录</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>没有账号？去注册</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  },
  buttonText: {
    textAlign: 'center',
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
