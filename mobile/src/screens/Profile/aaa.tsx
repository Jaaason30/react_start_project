// src/screens/EditProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/EditProfileScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const FULL_BASE_URL = 'http://10.0.2.2:8080';

type RootStackParamList = {
  PlayerProfile: { userId?: string };
  EditProfile: undefined;
};

type NavType = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavType>();
  const {
    profileData,
    refreshProfile,
    avatarVersion,
    bumpAvatarVersion,
  } = useUserProfile();

  const [nickname, setNickname] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [genderPreferences, setGenderPreferences] = useState<string[]>([]);
  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [albumUris, setAlbumUris] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredVenues, setPreferredVenues] = useState<string[]>([]);

  // 初始化表单值
  useEffect(() => {
    if (!profileData.uuid) return;
    setNickname(profileData.nickname || '');
    setBio(profileData.bio || '');
    setDateOfBirth(profileData.dateOfBirth || '');
    setCity(profileData.city?.name || '');
    setGender(profileData.gender?.text || '');
    setGenderPreferences(
      profileData.genderPreferences?.map(g => g.text) || []
    );
    setInterests(profileData.interests || []);
    setPreferredVenues(profileData.preferredVenues || []);
    setLocalProfileUri(null);
    setAlbumUris(
      (profileData.albumUrls || []).map(u =>
        u.startsWith('http') ? u : FULL_BASE_URL + u
      )
    );
  }, [profileData]);

  // 选头像
  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, resp => {
      if (resp.assets?.[0]?.uri) {
        setLocalProfileUri(resp.assets[0].uri);
      }
    });
  };

  // 选相册多图
  const selectAlbumImages = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 5 },
      resp => {
        if (resp.assets) {
          setAlbumUris(resp.assets.map(a => a.uri!).filter(Boolean));
        }
      }
    );
  };

  // 给 URL 加版本参数避免缓存
  const getVersionedUri = (base: string) => `${base}?v=${avatarVersion}`;

  // 点击“保存”按钮
  const handleSave = async () => {
    if (!profileData.uuid) {
      Alert.alert('错误', '用户未登录');
      return;
    }
    try {
      // 1) 基本字段
      const payload: any = {
        nickname,
        bio,
        dateOfBirth,
        city: { name: city },
        gender: { text: gender },
        genderPreferences: genderPreferences.map(t => ({ text: t })),
        interests,
        preferredVenues,
      };

      // 2) 头像 Base64+Mime
      if (localProfileUri && !localProfileUri.startsWith('http')) {
        const blob = await (await fetch(localProfileUri)).blob();
        payload.profileMime = blob.type;
        payload.profileBase64 = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }

      // 3) 相册多图 Base64List + MimeList
      if (albumUris.length > 0) {
        payload.albumBase64List = [];
        payload.albumMimeList = [];
        for (const uri of albumUris) {
          if (!uri.startsWith('http')) {
            const blob = await (await fetch(uri)).blob();
            payload.albumMimeList.push(blob.type);
            const b64 = await new Promise<string>(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(blob);
            });
            payload.albumBase64List.push(b64);
          }
        }
      }

      // 4) Debug 打印
      console.log('[EditProfile] payload:', payload);

      // 5) 发送请求
      await sendRequest(payload);
    } catch (err) {
      console.error('[SaveProfile]', err);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  // 发 PATCH 请求到后端
  const sendRequest = async (payload: any) => {
    try {
      const resp = await fetch(
        `${FULL_BASE_URL}/api/user/profile?userUuid=${profileData.uuid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || '保存失败');
      }
      // 更新 context 与头像版本
      await refreshProfile();
      bumpAvatarVersion();
      // 成功后弹框并返回
      Alert.alert('成功', '资料已更新', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('[PatchProfile]', err);
      Alert.alert('错误', err.message);
    }
  };

  // 决定头像显示源
  const profileSrc = localProfileUri
    ? localProfileUri
    : profileData.profilePictureUrl
    ? getVersionedUri(FULL_BASE_URL + profileData.profilePictureUrl)
    : undefined;

  return (
    <ScrollView style={styles.container}>
      {/* 顶部返回栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>编辑资料</Text>
        <View style={styles.backButton} />
      </View>

      {/* 表单字段 */}
      <Text style={styles.label}>昵称</Text>
      <TextInput
        style={styles.input}
        placeholder="输入昵称"
        value={nickname}
        onChangeText={setNickname}
      />

      <Text style={styles.label}>个性签名</Text>
      <TextInput
        style={styles.input}
        placeholder="输入个性签名"
        value={bio}
        onChangeText={setBio}
      />

      <Text style={styles.label}>生日</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <Text style={styles.label}>城市</Text>
      <TextInput
        style={styles.input}
        placeholder="输入城市名称"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>性别</Text>
      <TextInput
        style={styles.input}
        placeholder="输入性别"
        value={gender}
        onChangeText={setGender}
      />

      <Text style={styles.label}>想认识的性别偏好 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 男,女"
        value={genderPreferences.join(',')}
        onChangeText={txt => setGenderPreferences(txt.split(',').map(s => s.trim()))}
      />

      {/* 头像 */}
      <Text style={styles.label}>头像</Text>
      {profileSrc && (
        <FastImage
          source={{ uri: profileSrc }}
          style={styles.imagePreview}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={selectProfileImage}>
        <Text style={styles.buttonText}>上传头像</Text>
      </TouchableOpacity>

      {/* 相册 */}
      <Text style={styles.label}>相册</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {albumUris.map((uri, idx) => {
          const src = uri.startsWith('http') ? getVersionedUri(uri) : uri;
          return (
            <FastImage
              key={idx}
              source={{ uri: src }}
              style={styles.albumPreview}
              resizeMode={FastImage.resizeMode.cover}
            />
          );
        })}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={selectAlbumImages}>
        <Text style={styles.buttonText}>上传相册图片</Text>
      </TouchableOpacity>

      {/* 其他标签 */}
      <Text style={styles.label}>兴趣标签 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 旅行,音乐"
        value={interests.join(',')}
        onChangeText={txt => setInterests(txt.split(',').map(s => s.trim()))}
      />

      <Text style={styles.label}>偏好场所 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 咖啡厅,餐厅"
        value={preferredVenues.join(',')}
        onChangeText={txt => setPreferredVenues(txt.split(',').map(s => s.trim()))}
      />

      {/* 保存按钮 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存修改</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
