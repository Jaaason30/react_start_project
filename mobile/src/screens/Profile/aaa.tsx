// src/screens/Profile/PlayerProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
//import { styles } from '../../theme/PlayerProfileScreen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

export type RootStackParamList = {
  Dashboard: undefined;
  SeatOverview: undefined;
  Discover: undefined;
  PlayerProfile: { userId?: string } | undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ProfileRouteProp = RouteProp<RootStackParamList, 'PlayerProfile'>;

const BASE_URL = 'http://10.0.2.2:8080';

export default function PlayerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ProfileRouteProp>();
  const { profileData } = useUserProfile();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // Determine which UUID to fetch: route param or own profile
      const uuidToFetch = route.params?.userId ?? profileData?.uuid;
      if (!uuidToFetch) {
        console.warn('[FetchProfile] No UUID available, skipping fetch.');
        setLoading(false);
        return;
      }

      const url = `${BASE_URL}/api/user/profile?userUuid=${uuidToFetch}`;
      console.log('[FetchProfile] Fetching profile for UUID:', uuidToFetch);

      try {
        const response = await fetch(url);
        console.log('[FetchProfile] Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[FetchProfile] Received data:', data);
        setUserData(data);
      } catch (err) {
        console.error('[FetchProfile] Failed to load user profile:', err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [route.params?.userId, profileData?.uuid]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff00cc" />
        </View>
      ) : userData ? (
        <View style={styles.profileHeader}>
          <FastImage
            source={{
              uri: userData.profilePictureUrl
                ? BASE_URL + userData.profilePictureUrl
                : 'https://via.placeholder.com/200x200.png?text=No+Avatar',
            }}
            style={styles.avatar}
            onError={() => console.error('[Avatar] Failed to load avatar')}
            resizeMode={FastImage.resizeMode.cover}
          />
          <Text style={styles.nickname}>{userData.nickname ?? 'Unnamed User'}</Text>
          <Text style={styles.userId}>Age: {userData.age ?? 'N/A'} yrs</Text>

          {userData.city?.name && (
            <Text style={styles.userId}>From: {userData.city.name}</Text>
          )}
          {userData.gender?.text && (
            <Text style={styles.userId}>Gender: {userData.gender.text}</Text>
          )}

          {Array.isArray(userData.genderPreferences) &&
            userData.genderPreferences.length > 0 && (
              <Text style={styles.userId}>
                Seeks:{' '}
                {userData.genderPreferences.map((g: any) => g.text).join(' / ')}
              </Text>
            )}

          <Text style={styles.bio}>{userData.bio ?? 'No bio available.'}</Text>

          {Array.isArray(userData.interests) &&
            userData.interests.length > 0 && (
              <View style={styles.tags}>
                {userData.interests.map((int: any) => (
                  <Text key={int.id} style={styles.tag}>
                    #{int.name}
                  </Text>
                ))}
              </View>
            )}

          {Array.isArray(userData.albumUrls) && userData.albumUrls.length > 0 && (
            <View style={styles.albumWrapper}>
              <FlatList
                data={userData.albumUrls}
                keyExtractor={(item, idx) => `${item}-${idx}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumScrollContent}
                renderItem={({ item }) => {
                  const uri = BASE_URL + item;
                  return (
                    <FastImage
                      source={{ uri }}
                      style={styles.photoItem}
                      onError={() => console.error('[Album] Failed to load image:', uri)}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  );
                }}
              />
            </View>
          )}

          <Text style={styles.userId}>
            Likes Received: {userData.totalLikesReceived ?? 0}
          </Text>

          {Array.isArray(userData.preferredVenues) &&
            userData.preferredVenues.length > 0 && (
              <Text style={styles.userId}>
                Venues:{' '}
                {userData.preferredVenues.map((v: any) => v.name).join(' / ')}
              </Text>
            )}

          {userData.dates?.createdAt && (
            <Text style={styles.userId}>
              Joined: {new Date(userData.dates.createdAt).toLocaleDateString()}
            </Text>
          )}

          {userData.dates?.lastActiveAt && (
            <Text style={styles.userId}>
              Last Active: {new Date(userData.dates.lastActiveAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.userId}>Unable to load profile.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// src/theme/PlayerProfileScreen.styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GRID_GAP = 8;
const CARD_SIZE = (width - GRID_GAP * 3) / 2;

/* 横向照片墙尺寸 */
const PHOTO_HEIGHT = 160;
const PHOTO_V_PADDING = 12;
const PHOTO_WRAPPER_H = PHOTO_HEIGHT + PHOTO_V_PADDING * 2;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profileHeader: { alignItems: 'center', paddingVertical: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#ff00cc',
  },
  nickname: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginTop: 8 },
  userId: { color: '#aaa', fontSize: 12, marginTop: 4 },
  bio: { marginTop: 6, color: '#ccc', fontSize: 13, textAlign: 'center', paddingHorizontal: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: {
    color: '#0ff',
    fontSize: 12,
    backgroundColor: '#222',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  albumWrapper: {
    height: PHOTO_WRAPPER_H,
    paddingVertical: PHOTO_V_PADDING,
    marginTop: 12,
  },
  albumScrollContent: { paddingHorizontal: 12 },
  photoItem: { width: 120, height: PHOTO_HEIGHT, borderRadius: 12, marginRight: 10 },
  bottomBar: { /* ... if needed ... */ },
});
