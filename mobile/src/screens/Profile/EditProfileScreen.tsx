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
import { styles } from '../../theme/EditProfileScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const FULL_BASE_URL = 'http://10.0.2.2:8080';

const EditProfileScreen = () => {
  const {
    profileData,
    refreshProfile,
    avatarVersion,
    bumpAvatarVersion,
  } = useUserProfile();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [genderPreferences, setGenderPreferences] = useState<string[]>([]);
  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [albumUris, setAlbumUris] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredVenues, setPreferredVenues] = useState<string[]>([]);

  // 在 profileData 改变时初始化表单和相册列表
  useEffect(() => {
    if (!profileData.uuid) return;
    setNickname(profileData.nickname ?? '');
    setBio(profileData.bio ?? '');
    setDateOfBirth(profileData.dateOfBirth ?? '');
    setCity(profileData.city?.name ?? '');
    setGender(profileData.gender?.text ?? '');
    setGenderPreferences(
      profileData.genderPreferences?.map(g => g.text) ?? []
    );
    setInterests(profileData.interests ?? []);
    setPreferredVenues(profileData.preferredVenues ?? []);
    setLocalProfileUri(null);
    setAlbumUris(
      profileData.albumUrls?.map(u =>
        u.startsWith('http') ? u : FULL_BASE_URL + u
      ) ?? []
    );
  }, [profileData]);

  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, resp => {
      if (resp.assets?.[0]?.uri) {
        setLocalProfileUri(resp.assets[0].uri);
      }
    });
  };

  const selectAlbumImages = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 5 },
      resp => {
        if (resp.assets) {
          setAlbumUris(
            resp.assets
              .map(a => a.uri!)
              .filter(uri => !!uri)
          );
        }
      }
    );
  };

  const getVersionedUri = (base: string) =>
    `${base}?v=${avatarVersion}`;

  const handleSave = async () => {
    if (!profileData.uuid) {
      Alert.alert('错误', '用户未登录');
      return;
    }
    try {
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
      // 处理头像上传
      if (localProfileUri && !localProfileUri.startsWith('http')) {
        const blob = await (await fetch(localProfileUri)).blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          payload.profileBase64 = (reader.result as string).split(',')[1];
          payload.profileMime = blob.type;
          await sendRequest(payload);
        };
        reader.readAsDataURL(blob);
      } else {
        await sendRequest(payload);
      }
    } catch (err) {
      console.error('[SaveProfile]', err);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

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
      Alert.alert('成功', '资料已更新');
      await refreshProfile();
      bumpAvatarVersion();
    } catch (err: any) {
      console.error('[PatchProfile]', err);
      Alert.alert('错误', err.message);
    }
  };

  // 本地选择的 uri 优先预览，否则用 context 的带版本号 URL
  const profileSrc = localProfileUri
    ? localProfileUri
    : profileData.profilePictureUrl
    ? getVersionedUri(FULL_BASE_URL + profileData.profilePictureUrl)
    : undefined;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>编辑资料</Text>

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
        onChangeText={txt =>
          setGenderPreferences(txt.split(',').map(s => s.trim()))
        }
      />

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

      <Text style={styles.label}>相册</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {albumUris.map((uri, idx) => {
          const src = uri.startsWith('http')
            ? getVersionedUri(uri)
            : uri;
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

      <Text style={styles.label}>兴趣标签 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 旅行,音乐"
        value={interests.join(',')}
        onChangeText={txt =>
          setInterests(txt.split(',').map(s => s.trim()))
        }
      />

      <Text style={styles.label}>偏好场所 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 咖啡厅,餐厅"
        value={preferredVenues.join(',')}
        onChangeText={txt =>
          setPreferredVenues(txt.split(',').map(s => s.trim()))
        }
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存修改</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;
