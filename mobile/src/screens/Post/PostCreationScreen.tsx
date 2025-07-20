import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StatusBar, ScrollView, TouchableOpacity,
  TextInput, Image, Dimensions, StyleSheet, Platform, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import { patchProfileUrl } from '../Post/utils/urlHelpers';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');
const TH_SIZE = 80;
const GAP = 8;

const mockTags = ['台球技巧', 'Snooker', '英式台球', '斯诺克教学'];

const PostCreationScreen: React.FC = () => {
type PostCreationNav = NativeStackNavigationProp<RootStackParamList, 'PostCreation'>;
const nav = useNavigation<PostCreationNav>();
  const route = useRoute();
  const { profileData, avatarVersion } = useUserProfile();
  const [imgs, setImgs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selTags, setSelTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // 接收从 DiscoverScreen 传递过来的图片
  useEffect(() => {
    const params = route.params as any;
    if (params?.images && Array.isArray(params.images)) {
      // 将传入的图片 URI 转换为 launchImageLibrary 格式
      const formattedImages = params.images.map((uri: string, index: number) => ({
        uri,
        fileName: `image_${index}.jpg`,
        type: 'image/jpeg',
      }));
      setImgs(formattedImages);
    }
  }, [route.params]);

  const toggleTag = (t: string) =>
    setSelTags(selTags.includes(t) ? selTags.filter(x => x !== t) : [...selTags, t]);

  const addImg = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 9 - imgs.length });
    if (result.assets) {
      setImgs([...imgs, ...result.assets]);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim() || imgs.length === 0) {
      Alert.alert('提示', '请填写标题、正文并选择至少一张图片');
      return;
    }

    setIsPosting(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    selTags.forEach(tag => formData.append('tagNames', tag));
    imgs.forEach((img, i) => {
      formData.append('images', {
        uri: img.uri,
        name: img.fileName || `image${i}.jpg`,
        type: img.type || 'image/jpeg',
      } as any);
    });

    try {
      // 使用 apiClient.upload 方法处理 FormData
      const response = await apiClient.upload('/api/posts', formData);

      if (response.error) {
        console.error('[❌ 发布失败]', response.error);
        Alert.alert('发布失败', response.error);
      } else {
        console.log('[✅ 发布成功]', response.data);
        
        // 构造新帖子对象
        const newPost = {
          uuid: response.data.uuid || `temp-${Date.now()}`,
          title: title.trim(),
          content: content.trim(),
          images: imgs.map(img => img.uri),
          author: {
            shortId: profileData?.shortId,
            nickname: profileData?.nickname || '未知用户',
            profilePictureUrl: patchProfileUrl(profileData?.profilePictureUrl || '', avatarVersion),
          },
          likeCount: 0,
          collectCount: 0,
          commentCount: 0,
          likedByCurrentUser: false,
          collectedByCurrentUser: false,
          followedByCurrentUser: false,
        };

                
        // 调用回调函数更新列表
        const params = route.params as any;
        if (params?.onPostSuccess) {
          params.onPostSuccess(newPost);
        }
        
        // 直接返回广场，不显示 Alert
        nav.navigate('Discover');
      }
    } catch (error) {
      console.error('[❌ 网络错误]', error);
      Alert.alert('网络错误', '无法连接服务器，请检查网络连接');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.top}>
        <TouchableOpacity onPress={() => nav.goBack()} disabled={isPosting}>
          <Ionicons name="chevron-back" size={28} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal style={styles.imgRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {imgs.map((img, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.thumb} />
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => setImgs(imgs.filter((_, idx) => idx !== i))}
                disabled={isPosting}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {imgs.length < 9 && (
            <TouchableOpacity 
              style={[styles.addThumb, isPosting && styles.disabled]} 
              onPress={addImg}
              disabled={isPosting}
            >
              <Ionicons name="add" size={36} color="#aaa" />
              <Text style={styles.addTxt}>{`${imgs.length}/9`}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.form}>
          <TextInput
            placeholder="添加标题"
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            editable={!isPosting}
          />
          <TextInput
            placeholder="添加正文"
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={!isPosting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.secTitle}>标签</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockTags.map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip, 
                  selTags.includes(t) && styles.chipActive,
                  isPosting && styles.disabled
                ]}
                onPress={() => toggleTag(t)}
                disabled={isPosting}
              >
                <Text style={[styles.chipTxt, selTags.includes(t) && styles.chipTxtActive]}>
                  #{t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity 
          style={[styles.pubBtn, isPosting && styles.pubBtnDisabled]} 
          onPress={handlePost}
          disabled={isPosting}
        >
          <Text style={styles.pubTxt}>{isPosting ? '发布中...' : '发帖'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostCreationScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  top: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 8,
    height: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 8) + 44,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee',
    backgroundColor: '#fff',
  },
  imgRow: { marginTop: 16 },
  thumbWrap: { position: 'relative', marginRight: GAP },
  thumb: { width: TH_SIZE, height: TH_SIZE, borderRadius: 8 },
  delBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
  addThumb: {
    width: TH_SIZE, height: TH_SIZE, borderRadius: 8, borderWidth: 1,
    borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#fafafa'
  },
  addTxt: { fontSize: 11, color: '#888', marginTop: 2 },
  form: { paddingHorizontal: 16, marginTop: 20 },
  titleInput: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  contentInput: { fontSize: 16, color: '#333', height: 120, lineHeight: 24 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  secTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f5f5f5', marginRight: 8 },
  chipActive: { backgroundColor: '#ffecec' },
  chipTxt: { fontSize: 14, color: '#666' },
  chipTxtActive: { color: '#f44' },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, height: 64, borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee', backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  }, 
  pubBtn: { backgroundColor: '#f33', borderRadius: 24, paddingHorizontal: 26, paddingVertical: 10 },
  pubBtnDisabled: { backgroundColor: '#ffb3b3' },
  pubTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 }, 
});