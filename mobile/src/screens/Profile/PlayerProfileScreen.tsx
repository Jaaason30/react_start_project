import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
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
      if (!profileData?.uuid) {
        console.warn('[FetchProfile] No UUID available, skipping fetch.');
        return;
      }

      const fullUrl = `${FULL_BASE_URL}/api/user/profile?userUuid=${profileData.uuid}`;
      console.log('[FetchProfile] Fetching profile for UUID:', profileData.uuid);
      console.log('[FetchProfile] URL:', fullUrl);

      try {
        const response = await fetch(fullUrl);
        console.log('[FetchProfile] Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[FetchProfile] Received data:', data);
        if (!data) throw new Error('Backend returned empty data');

        setUserData(data);
      } catch (err) {
        console.error('[FetchProfile] Failed to load user profile:', err);
        setUserData(null);
      }
    };

    fetchProfile();
  }, [profileData?.uuid]);

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

      {userData ? (
        <View style={styles.profileHeader}>
          <FastImage
            source={{
              uri: userData.profilePictureUrl
                ? FULL_BASE_URL + userData.profilePictureUrl
                : 'https://via.placeholder.com/200x200.png?text=No+Avatar',
            }}
            style={styles.avatar}
            onError={() =>
              console.error('[Avatar] Failed to load avatar:')
            }
            resizeMode={FastImage.resizeMode.cover}
          />
          <Text style={styles.nickname}>
            {userData.nickname ?? 'Unnamed User'}
          </Text>
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

          <Text style={styles.bio}>
            {userData.bio ?? 'No bio available.'}
          </Text>

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

          {Array.isArray(userData.albumUrls) &&
            userData.albumUrls.length > 0 && (
              <FlatList
                data={userData.albumUrls}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  const imageUri = FULL_BASE_URL + item;
                  console.log('[Album] Rendering image:', imageUri);

                  return (
                    <FastImage
                      key={`${item}-${index}`}
                      source={{ uri: imageUri }}
                      style={styles.photoItem}
                      onError={() =>
                        console.error(
                          '[Album] Failed to load image:',
                          imageUri
                        )
                      }
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  );
                }}
              />
            )}

          <Text style={styles.userId}>
            Likes Received: {userData.totalLikesReceived}
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
              Joined:{' '}
              {new Date(userData.dates.createdAt).toLocaleDateString()}
            </Text>
          )}

          {userData.dates?.lastActiveAt && (
            <Text style={styles.userId}>
              Last Active:{' '}
              {new Date(userData.dates.lastActiveAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading user profile...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
