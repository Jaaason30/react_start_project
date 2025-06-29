import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../theme/PlayerProfileScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

export type RootStackParamList = {
  Dashboard: undefined;
  SeatOverview: undefined;
  Discover: undefined;
  PlayerProfile: { userId?: string } | undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FULL_BASE_URL = 'http://10.0.2.2:8080';

export default function PlayerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { profileData } = useUserProfile();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
const fetchProfile = async () => {
  try {
    const response = await fetch(
      `${FULL_BASE_URL}/api/user/profile?userUuid=${profileData?.uuid}`
    );
    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`);
    }

    const data = await response.json();
    if (!data) throw new Error("后端返回空");

    console.log('[✅ UserDto]', data);
    setUserData(data);
  } catch (err) {
    console.error('❌ 获取用户资料失败:', err);
    setUserData(null); // 确保不会保留旧的残缺数据
  }
};


    if (profileData?.uuid) {
      fetchProfile();
    }
  }, [profileData?.uuid]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 玩家信息 */}
      {userData && (
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: userData.profilePictureUrl
                ? FULL_BASE_URL + userData.profilePictureUrl
                : 'https://via.placeholder.com/200x200.png?text=No+Avatar',
            }}
            style={styles.avatar}
          />
          <Text style={styles.nickname}>{userData.nickname ?? '未命名用户'}</Text>
          <Text style={styles.userId}>年龄：{userData.age ?? '未填写'} 岁</Text>

          {userData.city?.name && (
            <Text style={styles.userId}>来自 {userData.city.name}</Text>
          )}
          {userData.gender?.text && (
            <Text style={styles.userId}>我是：{userData.gender.text}</Text>
          )}

          {userData.genderPreferences?.length > 0 && (
            <Text style={styles.userId}>
              想认识：
              {userData.genderPreferences.map((g: any) => g.text).join(' / ')}
            </Text>
          )}

          <Text style={styles.bio}>
            {userData.bio ?? '这个人很神秘，什么也没写'}
          </Text>

          {userData.interests?.length > 0 && (
            <View style={styles.tags}>
              {userData.interests.map((int: any) => (
                <Text key={int.id} style={styles.tag}>
                  #{int.name}
                </Text>
              ))}
            </View>
          )}

          {userData.albumUrls?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userData.albumUrls.map((url: string) => (
                <Image
                  key={url}
                  source={{ uri: FULL_BASE_URL + url }}
                  style={styles.photoItem}
                />
              ))}
            </ScrollView>
          )}

          <Text style={styles.userId}>
            收到赞数：{userData.totalLikesReceived}
          </Text>

          {userData.preferredVenues?.length > 0 && (
            <Text style={styles.userId}>
              常去：
              {userData.preferredVenues.map((v: any) => v.name).join(' / ')}
            </Text>
          )}

          {userData.dates?.createdAt && (
            <Text style={styles.userId}>
              加入时间：
              {new Date(userData.dates.createdAt).toLocaleDateString()}
            </Text>
          )}

          {userData.dates?.lastActiveAt && (
            <Text style={styles.userId}>
              最近活跃：
              {new Date(userData.dates.lastActiveAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

