import React, { useEffect } from 'react';
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
  { id: 1, label: '男' },
  { id: 2, label: '女' },
];

const INTEREST_TAGS = [
  { id: 1, label: '喝酒' },
  { id: 2, label: '桌球' },
  { id: 3, label: '安静聊天' },
  { id: 4, label: 'Live音乐' },
  { id: 5, label: '派对舞池' },
  { id: 6, label: '认证博主' },
  { id: 7, label: 'Techno' },
  { id: 8, label: 'EDM' },
  { id: 9, label: 'Hip-Hop' },
  { id: 10, label: 'R&B' },
];

const VENUE_TAGS = [
  { id: 1, name: 'Homebar', emoji: '🏠' },
  { id: 2, name: '夜店', emoji: '🕺' },
  { id: 3, name: 'Rooftop Bar', emoji: '🌇' },
  { id: 4, name: 'Livehouse', emoji: '🎵' },
];

export default function Step1Screen() {
  const navigation = useNavigation<any>();
  const { profileData, setProfileData } = useUserProfile();
  const gender = profileData.genderId;
  const genderPref = profileData.genderPreferenceIds ?? [];
  const interestIds = profileData.interestIds ?? [];
  const venueIds = profileData.venueIds ?? [];

  const canProceed = gender && genderPref.length > 0 && interestIds.length > 0;

  const toggleList = (arr: number[], id: number, key: keyof typeof profileData) => {
    const updated = arr.includes(id) ? arr.filter(i => i !== id) : [...arr, id];
    setProfileData(prev => ({ ...prev, [key]: updated }));
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
              key={opt.id}
              style={[
                styles.choiceBox,
                gender === opt.id && styles.choiceBoxSelected,
              ]}
              onPress={() =>
                setProfileData(prev => ({ ...prev, genderId: opt.id }))
              }
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
              key={opt.id}
              style={[
                styles.choiceBox,
                genderPref.includes(opt.id) && styles.choiceBoxSelected,
              ]}
              onPress={() => toggleList(genderPref, opt.id, 'genderPreferenceIds')}
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
              key={tag.id}
              style={[styles.tag, interestIds.includes(tag.id) && styles.tagSelected]}
              onPress={() => toggleList(interestIds, tag.id, 'interestIds')}
            >
              <Text style={styles.tagText}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 偏好场所 */}
        <Text style={styles.title}>偏好场所</Text>
        <View style={styles.wrap}>
          {VENUE_TAGS.map(({ id, name, emoji }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.venueCard,
                venueIds.includes(id) && styles.venueCardSelected,
              ]}
              onPress={() => toggleList(venueIds, id, 'venueIds')}
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
        onPress={() => {
          const { profileBase64, albumBase64List, ...rest } = profileData;

          console.log("🧾 Step1Screen 当前 profileData:", {
            ...rest,
            profileBase64Length: profileBase64?.length ?? 0,
            albumBase64ListCount: albumBase64List?.length ?? 0,
          });

          navigation.navigate('Step2Screen');
        }}

      >
        <Text style={styles.nextText}>下一步</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
