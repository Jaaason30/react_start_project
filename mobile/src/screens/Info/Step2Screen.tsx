// src/screens/Info/Step2Screen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/Step2Screen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

export default function Step2Screen({ navigation }: any) {
  const { profileData, setProfileData } = useUserProfile();
  
  // 添加空值检查
  const avatar = profileData?.profileBase64;
  const album = profileData?.albumBase64List ?? [];

  const pickImage = async (isAvatar: boolean) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1, includeBase64: true },
      (res) => {
        if (res.didCancel || !res.assets?.length) return;
        const asset = res.assets[0] as Asset;
        if (!asset.base64 || !asset.type) return;

        if (isAvatar) {
          setProfileData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              profileBase64: asset.base64!,
              profileMime: asset.type!,
            };
          });
        } else if (album.length < 6) {
          setProfileData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              albumBase64List: [...(prev.albumBase64List ?? []), asset.base64!],
              albumMimeList: [...(prev.albumMimeList ?? []), asset.type!],
            };
          });
        } else {
          Alert.alert('最多上传 6 张照片');
        }
      }
    );
  };

  const removePhoto = (idx: number) =>
    setProfileData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        albumBase64List: prev.albumBase64List?.filter((_, i) => i !== idx) ?? [],
        albumMimeList: prev.albumMimeList?.filter((_, i) => i !== idx) ?? [],
      };
    });

  const canProceed = !!avatar;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backWrapper}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>上传你的头像</Text>
      <TouchableOpacity style={styles.avatarWrapper} onPress={() => pickImage(true)}>
        {avatar ? (
          <Image
            source={{ uri: `data:${profileData?.profileMime};base64,${avatar}` }}
            style={styles.avatar}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#aaa" />
        )}
      </TouchableOpacity>

      <Text style={styles.title}>添加其他照片（最多 6 张）</Text>
      <FlatList
        data={album}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.photoBox}>
            <Image
              source={{ uri: `data:${profileData?.albumMimeList?.[index]};base64,${item}` }}
              style={styles.photo}
            />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index)}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          album.length < 6 ? (
            <TouchableOpacity style={styles.addBox} onPress={() => pickImage(false)}>
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 10 }}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity
        disabled={!canProceed}
        onPress={() => {
          navigation.navigate('Step3Screen');
        }}
        style={[styles.nextButton, !canProceed && styles.disabledButton]}
      >
        <Text style={styles.nextText}>下一步</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}