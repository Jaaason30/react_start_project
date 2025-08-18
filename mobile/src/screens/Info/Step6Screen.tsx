// src/screens/Step6Screen.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Step6Screen({ navigation, route }: any) {
  const nickname = route?.params?.nickname || '朋友';

  const handleStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Discover' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部动画图或插画 */}
      <View style={styles.heroImage}>
        <Ionicons name="heart-circle-outline" size={100} color="#ff4458" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>准备好开启夜色邂逅了吗，{nickname}？</Text>
        <Text style={styles.subtitle}>
          根据你的兴趣，我们已为你准备推荐对象与今晚活动！
        </Text>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startText}>开启探索</Text>
          <Ionicons name="rocket-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  heroImage: {
    width: '100%',
    height: 300,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4458',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});