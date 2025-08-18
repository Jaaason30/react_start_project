import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { useUserProfile } from '../contexts/UserProfileContext';
import { RootStackParamList } from '../App';
import tokenManager from '../services/tokenManager';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  onRegisterSuccess?: () => void;
};

const RegisterScreen: React.FC<Props> = ({ onRegisterSuccess }) => {
  const navigation = useNavigation<any>();
  const { setProfileData } = useUserProfile();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // 验证输入
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少6位');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await apiClient.post(API_ENDPOINTS.REGISTER, {
        email,
        password,
        nickname,
      });
      console.log(data);

      if (data && !error) {
        // 保存 JWT tokens
        await tokenManager.saveTokens(data.accessToken, data.refreshToken);

        // 更新全局上下文
        setProfileData((prev) => ({
          ...prev,
          uuid: data.userUuid,
          email: data.email,
          nickname: data.nickname,
        }));

        Alert.alert(
          '注册成功', 
          `欢迎 ${data.nickname}！`, 
          [
            { 
              text: '继续', 
              onPress: () => {
                // 通知 App 注册成功
                onRegisterSuccess?.();
                // 跳转到信息完善页面
                navigation.replace('Step1Screen');
              }
            }
          ]
        );
      } else {
        Alert.alert('注册失败', error || '请检查输入');
      }
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('网络错误', '无法连接到服务器');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>注册</Text>
        
        <TextInput
          placeholder="邮箱"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        
        <TextInput
          placeholder="昵称"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          editable={!isLoading}
        />
        
        <TextInput
          placeholder="密码（至少6位）"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={styles.buttonText}>注册</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.replace('Login')}
          disabled={isLoading}
        >
          <Text style={styles.link}>已有账号？去登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  input: {
    borderWidth: 1, 
    borderColor: Colors.border,
    backgroundColor: Colors.card, 
    color: Colors.text,
    borderRadius: 5, 
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    textAlign: 'center',
  },
  link: {
    color: Colors.primary, 
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;