import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, StatusBar, ScrollView, TouchableOpacity,
  TextInput, Image, Dimensions, StyleSheet, Platform, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useUserProfile } from '../../contexts/UserProfileContext';

const { width } = Dimensions.get('window');
const TH_SIZE = 80;
const GAP = 8;

const mockTags = ['台球技巧', 'Snooker', '英式台球', '斯诺克教学'];

// ✅ BASE_URL，后续可抽取为 constants
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const PostCreationScreen: React.FC = () => {
  const nav = useNavigation();
  const { profileData } = useUserProfile();
  const [imgs, setImgs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selTags, setSelTags] = useState<string[]>([]);

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
      Alert.alert('请填写标题、正文并选择至少一张图片');
      return;
    }
    if (!profileData?.uuid) {
      Alert.alert('无法获取当前用户，请重新登录');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('authorUuid', profileData.uuid);
    selTags.forEach(tag => formData.append('tagNames', tag));
    imgs.forEach((img, i) => {
      formData.append('images', {
        uri: img.uri,
        name: img.fileName || `image${i}.jpg`,
        type: img.type || 'image/jpeg',
      } as any);
    });

    try {
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        // ❌ 不手动加 Content-Type，RN 会自动携带正确 boundary
        body: formData,
      });

      if (res.ok) {
        Alert.alert('发布成功');
        nav.goBack();
      } else {
        const result = await res.json();
        console.error('[❌ 发布失败]', result);
        Alert.alert('发布失败', result.message || '请稍后重试');
      }
    } catch (error) {
      console.error('[❌ 网络错误]', error);
      Alert.alert('网络错误', '无法连接服务器');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.top}>
        <TouchableOpacity onPress={() => nav.goBack()}>
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
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {imgs.length < 9 && (
            <TouchableOpacity style={styles.addThumb} onPress={addImg}>
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
          />
          <TextInput
            placeholder="添加正文"
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.secTitle}>标签</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockTags.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, selTags.includes(t) && styles.chipActive]}
                onPress={() => toggleTag(t)}
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
        <TouchableOpacity style={styles.pubBtn} onPress={handlePost}>
          <Text style={styles.pubTxt}>发帖</Text>
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
  pubTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
