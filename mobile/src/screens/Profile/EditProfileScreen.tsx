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

  // 表单字段状态
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

  // 标记头像/相册是否被修改过
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [albumChanged, setAlbumChanged]   = useState(false);

  /**
   * 1) 首次挂载时，主动刷新 ProfileContext，
   * 保证 profileData 能尽快可用。
   */
  useEffect(() => {
    refreshProfile();
  }, []);

  /**
   * 2) 当 profileData 更新后，填充表单初始值。
   */
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
    setAvatarChanged(false);
    setAlbumChanged(false);
  }, [profileData]);

  // 选择新头像
  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, resp => {
      if (resp.assets?.[0]?.uri) {
        setLocalProfileUri(resp.assets[0].uri);
        setAvatarChanged(true);
      }
    });
  };

  // 选择新相册
  const selectAlbumImages = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 5 },
      resp => {
        if (resp.assets) {
          const uris = resp.assets.map(a => a.uri!).filter(Boolean);
          setAlbumUris(uris);
          setAlbumChanged(true);
        }
      }
    );
  };

  // 给 URL 加版本号避开缓存
  const getVersionedUri = (base: string) => `${base}?v=${avatarVersion}`;

  // 点击保存
  const handleSave = async () => {
    if (!profileData.uuid) {
      Alert.alert('错误', '用户未登录');
      return;
    }
    try {
      const payload: any = {};

      // 只有改动的字段才提交
      if (nickname !== (profileData.nickname || '')) payload.nickname = nickname;
      if (bio !== (profileData.bio || '')) payload.bio = bio;
      if (dateOfBirth !== (profileData.dateOfBirth || ''))
        payload.dateOfBirth = dateOfBirth;
      if (city !== (profileData.city?.name || ''))
        payload.city = { name: city };
      if (gender !== (profileData.gender?.text || ''))
        payload.gender = { text: gender };

      const origPrefs = profileData.genderPreferences?.map(g => g.text) || [];
      if (JSON.stringify(genderPreferences) !== JSON.stringify(origPrefs)) {
        payload.genderPreferences = genderPreferences.map(t => ({ text: t }));
      }
      if (JSON.stringify(interests) !== JSON.stringify(profileData.interests || [])) {
        payload.interests = interests;
      }
      if (
        JSON.stringify(preferredVenues) !==
        JSON.stringify(profileData.preferredVenues || [])
      ) {
        payload.preferredVenues = preferredVenues;
      }

      // 头像 Base64 + Mime
      if (avatarChanged && localProfileUri && !localProfileUri.startsWith('http')) {
        const blob = await (await fetch(localProfileUri)).blob();
        payload.profileMime = blob.type;
        payload.profileBase64 = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }

      // 相册 Base64List + MimeList
      if (albumChanged) {
        payload.albumBase64List = [];
        payload.albumMimeList   = [];
        for (const uri of albumUris) {
          if (!uri.startsWith('http')) {
            const blob = await (await fetch(uri)).blob();
            payload.albumMimeList.push(blob.type);
            const b64 = await new Promise<string>(resolve => {
              const reader = new FileReader();
              reader.onloadend = () =>
                resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(blob);
            });
            payload.albumBase64List.push(b64);
          }
        }
      }

      // 发出 PATCH
      await sendRequest(payload);
    } catch (err) {
      console.error('[SaveProfile]', err);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  // 真正发送到后台
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
      // 刷新上下文并 bump 版本号，强制图片刷新
      await refreshProfile();
      bumpAvatarVersion();
      Alert.alert('成功','资料已更新',[{
        text:'OK', onPress: ()=>navigation.goBack()
      }]);
    } catch (err:any) {
      console.error('[PatchProfile]', err);
      Alert.alert('错误', err.message);
    }
  };

  // 决定头像加载地址：本地预览优先，否则从服务器并加版本号
  const profileSrc = localProfileUri
    ? localProfileUri
    : profileData.profilePictureUrl
    ? getVersionedUri(FULL_BASE_URL + profileData.profilePictureUrl)
    : undefined;

  return (
    <ScrollView style={styles.container}>
      {/* 顶部返回栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>编辑资料</Text>
        <View style={styles.backButton} />
      </View>

      {/* 昵称 */}
      <Text style={styles.label}>昵称</Text>
      <TextInput
        style={styles.input}
        placeholder="输入昵称"
        value={nickname}
        onChangeText={setNickname}
      />

      {/* 个性签名 */}
      <Text style={styles.label}>个性签名</Text>
      <TextInput
        style={styles.input}
        placeholder="输入个性签名"
        value={bio}
        onChangeText={setBio}
      />

      {/* 生日 */}
      <Text style={styles.label}>生日</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      {/* 城市 */}
      <Text style={styles.label}>城市</Text>
      <TextInput
        style={styles.input}
        placeholder="输入城市名称"
        value={city}
        onChangeText={setCity}
      />

      {/* 性别 */}
      <Text style={styles.label}>性别</Text>
      <TextInput
        style={styles.input}
        placeholder="输入性别"
        value={gender}
        onChangeText={setGender}
      />

      {/* 性别偏好 */}
      <Text style={styles.label}>想认识的性别偏好 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 男,女"
        value={genderPreferences.join(',')}
        onChangeText={txt =>
          setGenderPreferences(txt.split(',').map(s => s.trim()))
        }
      />

      {/* 头像 */}
      <Text style={styles.label}>头像</Text>
      {profileSrc && (
        <FastImage
          source={{ uri: profileSrc }}
          style={styles.imagePreview}
          resizeMode={FastImage.resizeMode.cover}
          key={profileSrc}
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
              key={`${src}-${idx}`}
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

      {/* 兴趣标签 */}
      <Text style={styles.label}>兴趣标签 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 旅行,音乐"
        value={interests.join(',')}
        onChangeText={txt => setInterests(txt.split(',').map(s => s.trim()))}
      />

      {/* 偏好场所 */}
      <Text style={styles.label}>偏好场所 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 咖啡厅,餐厅"
        value={preferredVenues.join(',')}
        onChangeText={txt =>
          setPreferredVenues(txt.split(',').map(s => s.trim()))
        }
      />

      {/* 保存按钮 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存修改</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
