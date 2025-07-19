import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../services/apiClient';
import { patchUrl } from '../Post/utils/urlHelpers';

const { width } = Dimensions.get('window');

// 定义导航参数类型
type RootStackParamList = {
  // 其他路由...
  PostCreation: { images: string[] };
  TextToImage: { onImageGenerated?: (images: string[]) => void };
};

type TextToImageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TextToImage'>;
type TextToImageRouteProp = RouteProp<RootStackParamList, 'TextToImage'>;

const TextToImageScreen: React.FC = () => {
  const navigation = useNavigation<TextToImageNavigationProp>();
  const route = useRoute<TextToImageRouteProp>();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ text: string; imageUrl: string }>>([]);

  // 加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await apiClient.get('/api/text-images/history');
      if (response.data) {
        setHistory(response.data.slice(0, 10));
      }
    } catch (error) {
      console.log('加载历史记录失败', error);
    }
  };

  const generateImage = async () => {
    if (!text.trim()) {
      Alert.alert('提示', '请输入文字');
      return;
    }
    if (text.length > 30) {
      Alert.alert('提示', '文字不能超过30个字符');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/text-images/generate', { text: text.trim() });
      if (response.error) {
        throw new Error(response.error);
      }
      const fullImageUrl = patchUrl(response.data.imageUrl);
      if (fullImageUrl) {
        setImageUrl(fullImageUrl);
        setHistory(prev => [
          { text: text.trim(), imageUrl: fullImageUrl },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (error) {
      Alert.alert('错误', '图片生成失败，请重试');
      console.error('[TextToImage] 生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const useGeneratedImage = () => {
    if (!imageUrl) return;
    const params = route.params;
    if (params?.onImageGenerated) {
      params.onImageGenerated([imageUrl]);
      navigation.goBack();
    } else {
      navigation.navigate('PostCreation', { images: [imageUrl] });
    }
  };

  const saveToAlbum = async () => {
    Alert.alert(
      '保存图片',
      '保存功能需要相册权限，确定要保存吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => Alert.alert('提示', '保存功能开发中...') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>文字转图片</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="输入文字（最多30字）"
                placeholderTextColor="#999"
                value={text}
                onChangeText={setText}
                maxLength={30}
                multiline
              />
              <Text style={styles.charCount}>{text.length}/30</Text>
            </View>
            <TouchableOpacity
              style={[styles.generateButton, loading && styles.buttonDisabled]}
              onPress={generateImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>生成图片</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {imageUrl && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>生成结果</Text>
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.generatedImage} resizeMode="contain" />
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={useGeneratedImage}>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>使用图片</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={saveToAlbum}>
                    <Ionicons name="download-outline" size={18} color="#666" />
                    <Text style={[styles.actionButtonText, { color: '#666' }]}>保存</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>最近生成</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {history.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyItem}
                    onPress={() => {
                      setText(item.text);
                      setImageUrl(item.imageUrl);
                    }}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.historyImage} />
                    <Text style={styles.historyText} numberOfLines={2}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>
              <Ionicons name="bulb-outline" size={16} color="#666" /> 小贴士
            </Text>
            <Text style={styles.tipsText}>
              • 生成的图片为白底黑字样式{`\n`}
              • 文字会自动居中排版{`\n`}
              • 支持中英文混合输入{`\n`}
              • 生成的图片可直接用于发帖
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 8,
    height: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 8) + 44,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  inputSection: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  inputContainer: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 12, marginBottom: 16 },
  textInput: { fontSize: 16, lineHeight: 24, minHeight: 100, textAlignVertical: 'top', color: '#333' },
  charCount: { textAlign: 'right', color: '#999', fontSize: 12, marginTop: 8 },
  generateButton: { backgroundColor: '#f33', paddingVertical: 14, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  imageSection: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  imageContainer: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 12 },
  generatedImage: { width: '100%', height: 300, backgroundColor: '#fff', borderRadius: 8, marginBottom: 12 },
  imageActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, backgroundColor: '#f33', paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: '#f0f0f0' },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 4 },
  historySection: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  historyItem: { marginRight: 12, width: 100 },
  historyImage: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#f8f8f8' },
  historyText: { fontSize: 12, color: '#666', marginTop: 6, textAlign: 'center' },
  tipsSection: { backgroundColor: '#fff', padding: 16, marginBottom: 20 },
  tipsTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  tipsText: { fontSize: 13, color: '#999', lineHeight: 20 },
});

export default TextToImageScreen;
