// src/screens/Step1Screen.tsx
import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../theme/Step1Screen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const GENDER_OPTIONS = [
  { label: '男' },
  { label: '女' },
];

const INTEREST_TAGS = [
  { label: '喝酒' },
  { label: '桌球' },
  { label: '安静聊天' },
  { label: 'Live音乐' },
  { label: '派对舞池' },
  { label: '认证博主' },
  { label: 'Techno' },
  { label: 'EDM' },
  { label: 'Hip-Hop' },
  { label: 'R&B' },
];

const VENUE_TAGS = [
  { name: 'Homebar', emoji: '🏠' },
  { name: '夜店', emoji: '🕺' },
  { name: 'Rooftop Bar', emoji: '🌇' },
  { name: 'Livehouse', emoji: '🎵' },
];

export default function Step1Screen() {
  const navigation = useNavigation<any>();
  const { profileData, setProfileData } = useUserProfile();

  const selectedGender = profileData?.gender?.text;
  const selectedGenderPrefs = profileData?.genderPreferences?.map(g => g.text) ?? [];
  const selectedInterests = profileData?.interests ?? [];
  const selectedVenues = profileData?.preferredVenues ?? [];

  const canProceed =
    !!selectedGender &&
    selectedGenderPrefs.length > 0 &&
    selectedInterests.length > 0;

  const handleGenderSelect = useCallback((label: string) => {
    setProfileData(prev => ({ ...prev!, gender: { text: label } }));
  }, [setProfileData]);

  const togglePreference = useCallback((label: string) => {
    setProfileData(prev => {
      const current = prev?.genderPreferences?.map(g => g.text) ?? [];
      const updated = current.includes(label)
        ? current.filter(t => t !== label)
        : [...current, label];
      return { ...prev!, genderPreferences: updated.map(t => ({ text: t })) };
    });
  }, [setProfileData]);

  const toggleInterest = useCallback((label: string) => {
    setProfileData(prev => {
      const current = prev?.interests ?? [];
      const updated = current.includes(label)
        ? current.filter(t => t !== label)
        : [...current, label];
      return { ...prev!, interests: updated };
    });
  }, [setProfileData]);

  const toggleVenue = useCallback((name: string) => {
    setProfileData(prev => {
      const current = prev?.preferredVenues ?? [];
      const updated = current.includes(name)
        ? current.filter(n => n !== name)
        : [...current, name];
      return { ...prev!, preferredVenues: updated };
    });
  }, [setProfileData]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.skipWrapper}
        onPress={() => navigation.navigate('Discover')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.skipText}>跳过</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backWrapper}
        onPress={() => navigation.replace('Login')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>你的性别</Text>
        <View style={styles.row}>
          {GENDER_OPTIONS.map(opt => (
            <Pressable
              key={opt.label}
              style={({ pressed }) => [
                styles.choiceBox,
                selectedGender === opt.label && styles.choiceBoxSelected,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => handleGenderSelect(opt.label)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.choiceText}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.title}>想认识的人</Text>
        <View style={styles.row}>
          {GENDER_OPTIONS.map(opt => (
            <Pressable
              key={opt.label}
              style={({ pressed }) => [
                styles.choiceBox,
                selectedGenderPrefs.includes(opt.label) && styles.choiceBoxSelected,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => togglePreference(opt.label)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.choiceText}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.title}>你的兴趣偏好</Text>
        <View style={styles.wrap}>
          {INTEREST_TAGS.map(tag => (
            <Pressable
              key={tag.label}
              style={({ pressed }) => [
                styles.tag,
                selectedInterests.includes(tag.label) && styles.tagSelected,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => toggleInterest(tag.label)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.title}>偏好场所</Text>
        <View style={styles.wrap}>
          {VENUE_TAGS.map(({ name, emoji }) => (
            <Pressable
              key={name}
              style={({ pressed }) => [
                styles.venueCard,
                selectedVenues.includes(name) && styles.venueCardSelected,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => toggleVenue(name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.venueEmoji}>{emoji}</Text>
              <Text style={styles.venueText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          !canProceed && styles.disabledButton,
          pressed && canProceed && { opacity: 0.6 },
        ]}
        onPress={() => navigation.navigate('Step2Screen')}
        disabled={!canProceed}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.nextText}>下一步</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
