// src/screens/Step1Screen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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

  // 与 PartialUserDto 对齐的字段
  const selectedGender = profileData?.gender?.text;
  const selectedGenderPrefs = profileData?.genderPreferences?.map(g => g.text) ?? [];
  const selectedInterests = profileData?.interests ?? [];
  const selectedVenues = profileData?.preferredVenues ?? [];

  const canProceed =
    !!selectedGender &&
    selectedGenderPrefs.length > 0 &&
    selectedInterests.length > 0;

  const handleGenderSelect = (label: string) => {
    setProfileData(prev => ({
      ...prev!,
      gender: { text: label },
    }));
  };

  const togglePreference = (label: string) => {
    setProfileData(prev => {
      const current = prev?.genderPreferences?.map(g => g.text) ?? [];
      const updated = current.includes(label)
        ? current.filter(t => t !== label)
        : [...current, label];
      return {
        ...prev!,
        genderPreferences: updated.map(t => ({ text: t })),
      };
    });
  };

  const toggleInterest = (label: string) => {
    setProfileData(prev => {
      const current = prev?.interests ?? [];
      const updated = current.includes(label)
        ? current.filter(t => t !== label)
        : [...current, label];
      return { ...prev!, interests: updated };
    });
  };

  const toggleVenue = (name: string) => {
    setProfileData(prev => {
      const current = prev?.preferredVenues ?? [];
      const updated = current.includes(name)
        ? current.filter(n => n !== name)
        : [...current, name];
      return { ...prev!, preferredVenues: updated };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.skipWrapper}
        onPress={() => navigation.navigate('Discover')}
      >
        <Text style={styles.skipText}>跳过</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backWrapper}
        onPress={() => navigation.replace('Login')}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.inner}>
        {/* 性别 */}
        <Text style={styles.title}>你的性别</Text>
        <View style={styles.row}>
          {GENDER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.label}
              style={[
                styles.choiceBox,
                selectedGender === opt.label && styles.choiceBoxSelected,
              ]}
              onPress={() => handleGenderSelect(opt.label)}
            >
              <Text style={styles.choiceText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 想认识的人 */}
        <Text style={styles.title}>想认识的人</Text>
        <View style={styles.row}>
          {GENDER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.label}
              style={[
                styles.choiceBox,
                selectedGenderPrefs.includes(opt.label) && styles.choiceBoxSelected,
              ]}
              onPress={() => togglePreference(opt.label)}
            >
              <Text style={styles.choiceText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 兴趣偏好 */}
        <Text style={styles.title}>你的兴趣偏好</Text>
        <View style={styles.wrap}>
          {INTEREST_TAGS.map(tag => (
            <TouchableOpacity
              key={tag.label}
              style={[styles.tag, selectedInterests.includes(tag.label) && styles.tagSelected]}
              onPress={() => toggleInterest(tag.label)}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 偏好场所 */}
        <Text style={styles.title}>偏好场所</Text>
        <View style={styles.wrap}>
          {VENUE_TAGS.map(({ name, emoji }) => (
            <TouchableOpacity
              key={name}
              style={[
                styles.venueCard,
                selectedVenues.includes(name) && styles.venueCardSelected,
              ]}
              onPress={() => toggleVenue(name)}
            >
              <Text style={styles.venueEmoji}>{emoji}</Text>
              <Text style={styles.venueText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 下一步 */}
      <TouchableOpacity
        style={[styles.nextButton, !canProceed && styles.disabledButton]}
        disabled={!canProceed}
        onPress={() => navigation.navigate('Step2Screen')}
      >
        <Text style={styles.nextText}>下一步</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
