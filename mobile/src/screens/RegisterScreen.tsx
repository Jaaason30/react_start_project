import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Colors } from '../theme/colors'

export default function RegisterScreen() {
  const navigation = useNavigation<any>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const handleRegister = async () => {
    try {
      const res = await fetch('http://10.0.2.2:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname })
      })
      const body = await res.json()
      if (res.ok) {
        Alert.alert('注册成功', `欢迎 ${body.nickname}！`, [
          { text: '去登录', onPress: () => navigation.replace('Login') }
        ])
      } else {
        Alert.alert('注册失败', body.message || '请检查输入')
      }
    } catch {
      Alert.alert('网络错误', '无法连接到服务器')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>注册</Text>
      <TextInput
        placeholder="邮箱"
        placeholderTextColor={Colors.textSecondary}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="密码"
        placeholderTextColor={Colors.textSecondary}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="昵称"
        placeholderTextColor={Colors.textSecondary}
        style={styles.input}
        value={nickname}
        onChangeText={setNickname}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>注册</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.link}>已有账号？去登录</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.bg,
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  title: {
    fontSize: 24, color: Colors.text, marginBottom: 20
  },
  input: {
    width: '100%', borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.card, color: Colors.text,
    borderRadius: 5, padding: 10, marginBottom: 15
  },
  button: {
    width: '100%', backgroundColor: Colors.primary,
    padding: 12, borderRadius: 5, marginBottom: 10
  },
  buttonText: {
    color: Colors.text, fontWeight: 'bold', textAlign: 'center'
  },
  link: {
    color: Colors.primary, marginTop: 10
  }
})
