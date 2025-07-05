// src/screens/EditProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { styles } from '../../theme/EditProfileScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const FULL_BASE_URL = 'http://10.0.2.2:8080';

const EditProfileScreen = () => {
  const { profileData, refreshProfile } = useUserProfile();
  const [nickname, setNickname] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [genderPreferences, setGenderPreferences] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredVenues, setPreferredVenues] = useState<string[]>([]);
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    if (!profileData?.uuid) return;
    fetchProfile();
  }, [profileData?.uuid]);

  const fetchProfile = async () => {
    if (!profileData?.uuid) return;
    
    try {
      const resp = await fetch(`${FULL_BASE_URL}/api/user/profile?userUuid=${profileData.uuid}`);
      const data = await resp.json();
      console.log('[FetchProfile] raw data:', data);
      setNickname(data.nickname ?? '');
      setBio(data.bio ?? '');
      setDateOfBirth(data.dateOfBirth ?? '');
      setCity(data.city?.name ?? '');
      setGender(data.gender?.text ?? '');
      setGenderPreferences(data.genderPreferences?.map((g: { text: string }) => g.text) ?? []);
      
      // 添加时间戳来防止缓存
      const timestamp = Date.now();
      setImageTimestamp(timestamp);
      
      if (data.profilePictureUrl) {
        setProfileImage(`${FULL_BASE_URL}${data.profilePictureUrl}?t=${timestamp}`);
      } else {
        setProfileImage(null);
      }
      
      setAlbumImages(data.albumUrls?.map((url: string) => `${FULL_BASE_URL}${url}?t=${timestamp}`) ?? []);
      setInterests(data.interests ?? []);
      setPreferredVenues(data.preferredVenues ?? []);
    } catch (err) {
      console.error('[FetchProfile]', err);
      Alert.alert('错误', '加载资料失败，请检查网络');
    }
  };

  const selectProfileImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const selectAlbumImages = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const uris = response.assets.map(asset => asset.uri).filter((uri): uri is string => uri !== undefined);
        setAlbumImages(uris);
      }
    });
  };

  const handleSave = async () => {
    if (!profileData?.uuid) {
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
        genderPreferences: genderPreferences.map(text => ({ text })),
        interests,
        preferredVenues,
      };

      // 处理头像上传（转换为 Base64）
      if (profileImage && !profileImage.startsWith('http')) {
        const file = await fetch(profileImage);
        const blob = await file.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          payload.profileBase64 = base64data;
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
      const resp = await fetch(`${FULL_BASE_URL}/api/user/profile?userUuid=${profileData.uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        Alert.alert('成功', '资料已更新');
        
        // 更新成功后重新获取用户资料
        await refreshProfile();  // 假设UserProfileContext提供了此方法
        fetchProfile();  // 重新加载当前页面数据
        
        // 更新时间戳，强制刷新图片
        setImageTimestamp(Date.now());
      } else {
        const errorData = await resp.json().catch(() => ({}));
        Alert.alert('错误', errorData.message || '保存失败，请检查输入或稍后再试');
      }
    } catch (err) {
      console.error('[PatchProfile]', err);
      Alert.alert('错误', '保存失败，请检查网络');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>编辑资料</Text>

      <Text style={styles.label}>昵称</Text>
      <TextInput style={styles.input} placeholder="输入昵称" value={nickname} onChangeText={setNickname} />

      <Text style={styles.label}>个性签名</Text>
      <TextInput style={styles.input} placeholder="输入个性签名" value={bio} onChangeText={setBio} />

      <Text style={styles.label}>生日</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={dateOfBirth} onChangeText={setDateOfBirth} />

      <Text style={styles.label}>城市</Text>
      <TextInput style={styles.input} placeholder="输入城市名称" value={city} onChangeText={setCity} />

      <Text style={styles.label}>性别</Text>
      <TextInput style={styles.input} placeholder="输入性别" value={gender} onChangeText={setGender} />

      <Text style={styles.label}>想认识的性别偏好 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 男,女"
        value={genderPreferences.join(',')}
        onChangeText={text => setGenderPreferences(text.split(',').map(s => s.trim()))}
      />

      <Text style={styles.label}>头像</Text>
      {profileImage && (
        <Image 
          source={{ uri: profileImage, cache: 'reload' }} 
          style={styles.imagePreview}
          key={`profile-${imageTimestamp}`}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={selectProfileImage}>
        <Text style={styles.buttonText}>上传头像</Text>
      </TouchableOpacity>

      <Text style={styles.label}>相册</Text>
      <ScrollView horizontal>
        {albumImages.map((uri, idx) => (
          <Image 
            key={`album-${idx}-${imageTimestamp}`} 
            source={{ uri, cache: 'reload' }} 
            style={styles.albumPreview} 
          />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={selectAlbumImages}>
        <Text style={styles.buttonText}>上传相册图片</Text>
      </TouchableOpacity>

      <Text style={styles.label}>兴趣标签 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 旅行,音乐"
        value={interests.join(',')}
        onChangeText={text => setInterests(text.split(',').map(s => s.trim()))}
      />

      <Text style={styles.label}>偏好场所 (逗号分隔)</Text>
      <TextInput
        style={styles.input}
        placeholder="如 咖啡厅,餐厅"
        value={preferredVenues.join(',')}
        onChangeText={text => setPreferredVenues(text.split(',').map(s => s.trim()))}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存修改</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;