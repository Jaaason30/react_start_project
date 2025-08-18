// src/screens/WriteTextScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { patchUrl } from '../Post/utils/urlHelpers';   // ← 新增

type WriteTextNav   = NativeStackNavigationProp<RootStackParamList, 'WriteText'>;
type WriteTextRoute = RouteProp<RootStackParamList, 'WriteText'>;

export default function WriteTextScreen() {
  const navigation  = useNavigation<WriteTextNav>();
  const route       = useRoute<WriteTextRoute>();
  const { onPostSuccess } = route.params || {};        // 仅需回调

  const [text, setText]           = useState('');
  const [styleType, setStyleType] = useState<1 | 2 | 3>(1);
  const [loading, setLoading]     = useState(false);

  /* 点击「下一步」：生成图片并跳转 */
  const handleNext = async () => {
    if (!text.trim()) {
      Alert.alert('提示', '请先输入文字');
      return;
    }
    setLoading(true);
    try {
      // 调用后端生成图片
      const resp = await apiClient.post<{ imageUrl: string }>(
        API_ENDPOINTS.TEXT_IMAGES_GENERATE,
        { text, styleType }
      );
      const rawUrl = resp.data?.imageUrl;
      if (!rawUrl) {
        Alert.alert('错误', '未收到图片 URL');
        return;
      }
      // 解析相对路径 → 绝对 URL
      const imageUrl = patchUrl(rawUrl) ?? rawUrl;

      navigation.navigate('PostCreation', {
        source: 'text',
        images: [imageUrl],
        onPostSuccess,     
      });
    } catch (err) {
      console.error('[WriteTextScreen] generate error:', err);
      Alert.alert('错误', '生成图片失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 背景渐变 */}
      <LinearGradient colors={['#D2F5E3', '#F8F9FA']} style={styles.gradient} />

      {/* 顶部栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.iconButton}>
          <Ionicons name="close" size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextText}>下一步</Text>}
        </TouchableOpacity>
      </View>

      {/* 输入卡片 */}
      <View style={styles.card}>
        <Text style={styles.title}>写文字</Text>

        {/* 风格选择 */}
        <View style={styles.styleSelector}>
          {[1, 2, 3].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.styleOption, styleType === t && styles.styleOptionSelected]}
              onPress={() => setStyleType(t as 1 | 2 | 3)}
            >
              <Text
                style={[
                  styles.styleOptionText,
                  styleType === t && styles.styleOptionTextSelected,
                ]}
              >
                {t === 1 ? '渐变风格' : t === 2 ? '卡片风格' : '创意风格'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="说点什么或提个问题…"
          placeholderTextColor="#AAA"
          multiline
          value={text}
          onChangeText={setText}
        />
      </View>
    </SafeAreaView>
  );
}

/* ----------------------- 样式 ----------------------- */
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  gradient:  { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  iconButton:{ padding: 8 },
  nextButton:{ backgroundColor: '#FF7F7F', borderRadius: 20, padding: 6, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#FFC4C4' },
  nextText:  { color: '#FFF', fontSize: 16, fontWeight: '500' },
  card:      {
    margin: 16,
    backgroundColor: '#FFF',
    padding: 16,
    minHeight: 600,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  styleSelector: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  styleOption: {
    borderWidth: 1,
    borderColor: '#FF7F7F',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  styleOptionSelected: { backgroundColor: '#FF7F7F' },
  styleOptionText:     { fontSize: 14, color: '#FF7F7F' },
  styleOptionTextSelected: { color: '#FFF' },
  input: { flex: 1, fontSize: 30, textAlign: 'center', textAlignVertical: 'center' },
});
