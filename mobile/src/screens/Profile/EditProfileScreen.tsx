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

type AlbumItem = {
  uri: string;
  isNew: boolean;
  originalUrl?: string;
};

export default function EditProfileScreen() {
  const navigation = useNavigation<NavType>();
  const {
    profileData,
    isLoading,
    refreshProfile,
    avatarVersion,
    bumpAvatarVersion,
  } = useUserProfile();

  const [albumItems, setAlbumItems] = useState<AlbumItem[]>([]);
  const [deletedOriginalUrls, setDeletedOriginalUrls] = useState<string[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [genderPreferences, setGenderPreferences] = useState<string[]>([]);
  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredVenues, setPreferredVenues] = useState<string[]>([]);
  const [avatarChanged, setAvatarChanged] = useState<boolean>(false);
  const [albumChanged, setAlbumChanged] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (profileData) {
      setNickname(profileData.nickname || '');
      setBio(profileData.bio || '');
      setDateOfBirth(profileData.dateOfBirth || '');
      setCity(profileData.city?.name || '');
      setGender(profileData.gender?.text || '');
      setGenderPreferences(profileData.genderPreferences?.map(g => g.text) || []);
      setInterests(profileData.interests || []);
      setPreferredVenues(profileData.preferredVenues || []);
      const initialAlbumItems: AlbumItem[] = (profileData.albumUrls || []).map(url => ({
        uri: url.startsWith('http') ? url : FULL_BASE_URL + url,
        isNew: false,
        originalUrl: url
      }));
      setAlbumItems(initialAlbumItems);
      setDeletedOriginalUrls([]);
      setAlbumChanged(false);
    }
  }, [profileData]);

  if (isLoading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, resp => {
      const uri = resp.assets?.[0]?.uri;
      if (uri) {
        setLocalProfileUri(uri);
        setAvatarChanged(true);
      }
    });
  };

  const selectAlbumImages = () => {
    const remainingSlots = 5 - albumItems.length;
    if (remainingSlots <= 0) {
      Alert.alert('提示', '相册最多只能上传5张图片');
      return;
    }
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: remainingSlots },
      resp => {
        const newItems = resp.assets?.map(asset => ({
          uri: asset.uri!,
          isNew: true
        })).filter((item): item is AlbumItem => Boolean(item.uri)) || [];
        if (newItems.length) {
          setAlbumItems([...albumItems, ...newItems]);
          setAlbumChanged(true);
        }
      }
    );
  };

  const removeAlbumItem = (index: number) => {
    const item = albumItems[index];
    if (!item.isNew && item.originalUrl) {
      setDeletedOriginalUrls([...deletedOriginalUrls, item.originalUrl]);
    }
    const newItems = [...albumItems];
    newItems.splice(index, 1);
    setAlbumItems(newItems);
    setAlbumChanged(true);
  };

  const getVersionedUri = (base: string) => `${base}?v=${avatarVersion}`;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = {};

      // 字段变化
      if (nickname !== (profileData.nickname || '')) payload.nickname = nickname;
      if (bio !== (profileData.bio || '')) payload.bio = bio;
      if (dateOfBirth !== (profileData.dateOfBirth || '')) payload.dateOfBirth = dateOfBirth;
      if (city !== (profileData.city?.name || '')) payload.city = { name: city };
      if (gender !== (profileData.gender?.text || '')) payload.gender = { text: gender };

      const origPrefs = profileData.genderPreferences?.map(g => g.text) || [];
      if (JSON.stringify(genderPreferences) !== JSON.stringify(origPrefs)) {
        payload.genderPreferences = genderPreferences.map(t => ({ text: t }));
      }
      if (JSON.stringify(interests) !== JSON.stringify(profileData.interests || [])) {
        payload.interests = interests;
      }
      if (JSON.stringify(preferredVenues) !== JSON.stringify(profileData.preferredVenues || [])) {
        payload.preferredVenues = preferredVenues;
      }

      // 头像上传
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

      // 相册处理
      if (albumChanged) {
        const keepUrls = albumItems
          .filter(item => !item.isNew && item.originalUrl)
          .map(item => item.originalUrl!);
        payload.keepAlbumUrls = keepUrls;

        const newImages = albumItems.filter(item => item.isNew);
        if (newImages.length > 0) {
          payload.albumMimeList = [];
          payload.albumBase64List = [];
          for (const item of newImages) {
            const blob = await (await fetch(item.uri)).blob();
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

      if (Object.keys(payload).length > 0) {
        // 使用 /api/user/me PATCH，无需 uuid 参数
        const response = await apiClient.patch(API_ENDPOINTS.USER_ME, payload);
        if (response.error) throw new Error(response.error);

        await refreshProfile();
        bumpAvatarVersion();

        Alert.alert('成功', '资料已更新', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('提示', '没有需要保存的修改');
        navigation.goBack();
      }
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
      {/* 顶部栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
        onChangeText={setNickname}
        editable={!isSaving}
      />

      <Text style={styles.label}>个性签名</Text>
      <TextInput
        style={styles.input}
        placeholder="输入个性签名"
        value={bio}
        onChangeText={setBio}
        editable={!isSaving}
      />

      <Text style={styles.label}>生日</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        editable={!isSaving}
      />

      <Text style={styles.label}>城市</Text>
      <TextInput
        style={styles.input}
        placeholder="输入城市名称"
        value={city}
        onChangeText={setCity}
        editable={!isSaving}
      />

      <Text style={styles.label}>性别</Text>
      <TextInput
        style={styles.input}
        placeholder="输入性别"
        value={gender}
        onChangeText={setGender}
        editable={!isSaving}
      />

      <Text style={styles.label}>想认识的性别偏好 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 男,女"
        value={genderPreferences.join(',')}
        onChangeText={(txt) =>
          setGenderPreferences(txt.split(',').map((s) => s.trim()).filter(Boolean))
        }
        editable={!isSaving}
      />

      <Text style={styles.label}>兴趣标签 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 旅行,音乐"
        value={interests.join(',')}
        onChangeText={(txt) =>
          setInterests(txt.split(',').map((s) => s.trim()).filter(Boolean))
        }
        editable={!isSaving}
      />

      <Text style={styles.label}>偏好场所 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 咖啡厅,餐厅"
        value={preferredVenues.join(',')}
        onChangeText={(txt) =>
          setPreferredVenues(txt.split(',').map((s) => s.trim()).filter(Boolean))
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
        <Text style={styles.buttonText}>更换头像</Text>
      </TouchableOpacity>

      <Text style={styles.label}>相册 ({albumItems.length}/5)</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.albumScrollView}
      >
        {albumItems.map((item, idx) => {
          const displayUri = item.isNew ? item.uri : getVersionedUri(item.uri);
          return (
            <View key={`album-${idx}-${item.uri}`} style={styles.albumItemWrapper}>
              <FastImage
                source={{ uri: displayUri }}
                style={styles.albumPreview}
                resizeMode={FastImage.resizeMode.cover}
              />
              <TouchableOpacity
                style={styles.albumRemoveButton}
                onPress={() => removeAlbumItem(idx)}
                disabled={isSaving}
              >
                <Ionicons name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>新</Text>
                </View>
              )}
            </View>
          );
        })}
        {albumItems.length < 5 && (
          <TouchableOpacity
            style={[styles.addAlbumButton, isSaving && styles.buttonDisabled]}
            onPress={selectAlbumImages}
            disabled={isSaving}
          >
            <Ionicons name="add-circle-outline" size={40} color="#666" />
            <Text style={styles.addAlbumText}>添加图片</Text>
          </TouchableOpacity>
        )}
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

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}