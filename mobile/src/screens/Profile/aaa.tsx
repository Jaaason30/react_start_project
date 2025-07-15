// src/screens/EditProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/EditProfileScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';

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
    isLoading,
    refreshProfile,
    avatarVersion,
    bumpAvatarVersion,
  } = useUserProfile();

  if (isLoading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const [nickname, setNickname] = useState<string>(profileData.nickname || '');
  const [bio, setBio] = useState<string>(profileData.bio || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(profileData.dateOfBirth || '');
  const [city, setCity] = useState<string>(profileData.city?.name || '');
  const [gender, setGender] = useState<string>(profileData.gender?.text || '');
  const [genderPreferences, setGenderPreferences] = useState<string[]>(
    profileData.genderPreferences?.map((g) => g.text) || []
  );
  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [albumUris, setAlbumUris] = useState<string[]>(
    (profileData.albumUrls || []).map((u) =>
      u.startsWith('http') ? u : FULL_BASE_URL + u
    )
  );
  const [interests, setInterests] = useState<string[]>(profileData.interests || []);
  const [preferredVenues, setPreferredVenues] = useState<string[]>(
    profileData.preferredVenues || []
  );

  const [avatarChanged, setAvatarChanged] = useState<boolean>(false);
  const [albumChanged, setAlbumChanged] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (resp) => {
      const uri = resp.assets?.[0]?.uri;
      if (uri) {
        setLocalProfileUri(uri);
        setAvatarChanged(true);
      }
    });
  };

  const selectAlbumImages = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 5 },
      (resp) => {
        const uris = resp.assets?.map((a) => a.uri!).filter(Boolean) || [];
        if (uris.length) {
          setAlbumUris(uris);
          setAlbumChanged(true);
        }
      }
    );
  };

  const getVersionedUri = (base: string) => `${base}?v=${avatarVersion}`;

  const handleSave = async () => {
    if (!profileData.uuid) {
      Alert.alert('错误', '用户未登录');
      return;
    }
    setIsSaving(true);

    try {
      const payload: any = {};

      if (nickname !== profileData.nickname) payload.nickname = nickname;
      if (bio !== profileData.bio) payload.bio = bio;
      if (dateOfBirth !== profileData.dateOfBirth)
        payload.dateOfBirth = dateOfBirth;
      if (city !== profileData.city?.name) payload.city = { name: city };
      if (gender !== profileData.gender?.text)
        payload.gender = { text: gender };

      const origPrefs = profileData.genderPreferences?.map((g) => g.text) || [];
      if (JSON.stringify(genderPreferences) !== JSON.stringify(origPrefs)) {
        payload.genderPreferences = genderPreferences.map((t) => ({ text: t }));
      }
      if (JSON.stringify(interests) !== JSON.stringify(profileData.interests))
        payload.interests = interests;
      if (
        JSON.stringify(preferredVenues) !==
        JSON.stringify(profileData.preferredVenues)
      )
        payload.preferredVenues = preferredVenues;

      if (
        avatarChanged &&
        localProfileUri &&
        !localProfileUri.startsWith('http')
      ) {
        const blob = await (await fetch(localProfileUri)).blob();
        payload.profileMime = blob.type;
        payload.profileBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
      }

      if (albumChanged) {
        payload.albumMimeList = [];
        payload.albumBase64List = [];
        for (const uri of albumUris) {
          if (!uri.startsWith('http')) {
            const blob = await (await fetch(uri)).blob();
            payload.albumMimeList.push(blob.type);
            const b64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () =>
                resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(blob);
            });
            payload.albumBase64List.push(b64);
          }
        }
      }

      const endpoint = `${API_ENDPOINTS.USER_UPDATE}?userUuid=${profileData.uuid}`;
      const response = await apiClient.patch(endpoint, payload);
      if (response.error) throw new Error(response.error);

      await refreshProfile();
      bumpAvatarVersion();

      Alert.alert('成功', '资料已更新', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('[SaveProfile]', err);
      Alert.alert('错误', err.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const profileSrc = localProfileUri
    ? localProfileUri
    : profileData.profilePictureUrl
    ? getVersionedUri(FULL_BASE_URL + profileData.profilePictureUrl)
    : undefined;

  return (
    <ScrollView style={styles.container}>
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

      <Text style={styles.label}>昵称</Text>
      <TextInput
        style={styles.input}
        placeholder="输入昵称"
        value={nickname}
        onChangeText={(txt: string) => setNickname(txt)}
        editable={!isSaving}
      />

      <Text style={styles.label}>个性签名</Text>
      <TextInput
        style={styles.input}
        placeholder="输入个性签名"
        value={bio}
        onChangeText={(txt: string) => setBio(txt)}
        editable={!isSaving}
      />

      <Text style={styles.label}>生日</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={(txt: string) => setDateOfBirth(txt)}
        editable={!isSaving}
      />

      <Text style={styles.label}>城市</Text>
      <TextInput
        style={styles.input}
        placeholder="输入城市名称"
        value={city}
        onChangeText={(txt: string) => setCity(txt)}
        editable={!isSaving}
      />

      <Text style={styles.label}>性别</Text>
      <TextInput
        style={styles.input}
        placeholder="输入性别"
        value={gender}
        onChangeText={(txt: string) => setGender(txt)}
        editable={!isSaving}
      />

      <Text style={styles.label}>想认识的性别偏好 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 男,女"
        value={genderPreferences.join(',')}
        onChangeText={(txt: string) =>
          setGenderPreferences(txt.split(',').map((s: string) => s.trim()))
        }
        editable={!isSaving}
      />

      <Text style={styles.label}>兴趣标签 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 旅行,音乐"
        value={interests.join(',')}
        onChangeText={(txt: string) =>
          setInterests(txt.split(',').map((s: string) => s.trim()))
        }
        editable={!isSaving}
      />

      <Text style={styles.label}>偏好场所 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 咖啡厅,餐厅"
        value={preferredVenues.join(',')}
        onChangeText={(txt: string) =>
          setPreferredVenues(txt.split(',').map((s: string) => s.trim()))
        }
        editable={!isSaving}
      />

      <Text style={styles.label}>头像</Text>
      {profileSrc && (
        <FastImage
          source={{ uri: profileSrc }}
          style={styles.imagePreview}
          resizeMode={FastImage.resizeMode.cover}
          key={profileSrc}
        />
      )}
      <TouchableOpacity
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={selectProfileImage}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>上传头像</Text>
      </TouchableOpacity>

      <Text style={styles.label}>相册</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {albumUris.map((uri, idx) => {
          const src = uri.startsWith('http') ? getVersionedUri(uri) : uri;
          return (
            <View key={`${src}-${idx}`} style={styles.albumWrapper}>
              <FastImage
                source={{ uri: src }}
                style={styles.albumPreview}
                resizeMode={FastImage.resizeMode.cover}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  const newArr = [...albumUris];
                  newArr.splice(idx, 1);
                  setAlbumUris(newArr);
                }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.addBox}
          onPress={selectAlbumImages}
          disabled={isSaving}
        >
          <Text style={styles.addText}>＋</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? '保存中...' : '保存修改'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
