// src/screens/Info/Step3Screen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/Step3Screen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';

const CITY_OPTIONS = [
  { id: 1, label: '北京' },
  { id: 2, label: '上海' },
  { id: 3, label: '广州' },
  { id: 4, label: '深圳' },
  { id: 5, label: '杭州' },
  { id: 6, label: '成都' },
  { id: 7, label: '重庆' },
  { id: 8, label: '武汉' },
  { id: 9, label: '西安' },
  { id: 10, label: '南京' },
];

export default function Step3Screen({ navigation }: any) {
  const { profileData, setProfileData } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const defaultYear = (currentYear - 25).toString();
  const defaultMonth = '01';
  const defaultDay = '01';

  const birth = profileData.dateOfBirth ?? `${defaultYear}-${defaultMonth}-${defaultDay}`;
  const [birthYear, setBirthYear] = useState(birth.split('-')[0]);
  const [birthMonth, setBirthMonth] = useState(birth.split('-')[1]);
  const [birthDay, setBirthDay] = useState(birth.split('-')[2]);

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const generateYears = () =>
    Array.from({ length: currentYear - 1949 }, (_, i) =>
      (currentYear - i).toString()
    );

  const generateMonths = () =>
    Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const generateDays = () => {
    const daysInMonth = new Date(
      parseInt(birthYear),
      parseInt(birthMonth),
      0
    ).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );
  };

  const getBirthDisplayString = () =>
    `${birthYear}-${birthMonth}-${birthDay}`;

  const selectedCity = CITY_OPTIONS.find(c => c.id === profileData.cityId);

  const handleNext = async () => {
    if (loading) return;
    setLoading(true);

    const composedDate = getBirthDisplayString();
    const updatedProfile = {
      ...profileData,
      nickname: profileData.nickname ?? '',
      bio: profileData.bio ?? '',
      dateOfBirth: composedDate,
    };
    setProfileData(updatedProfile);

    const { uuid } = updatedProfile;
    if (!uuid) {
      Alert.alert("错误", "未检测到用户 ID");
      setLoading(false);
      return;
    }

    const {
      nickname,
      bio,
      genderId,
      genderPreferenceIds,
      interestIds,
      venueIds,
      cityId,
      dateOfBirth,
      profileBase64,
      profileMime,
      albumBase64List,
      albumMimeList,
    } = updatedProfile;

    const payload = {
      nickname,
      bio,
      genderId,
      genderPreferenceIds,
      interestIds,
      venueIds,
      cityId,
      dateOfBirth,
      profileBase64,
      profileMime,
      albumBase64List,
      albumMimeList,
    };

    console.log("🚀 正在上传资料至后端：", {
      uuid,
      nickname,
      bio,
      genderId,
      genderPreferenceIds,
      interestIds,
      venueIds,
      cityId,
      dateOfBirth,
      profileBase64Length: profileBase64?.length ?? 0,
      albumBase64ListCount: albumBase64List?.length ?? 0,
    });

    try {
      const response = await fetch(`http://10.0.2.2:8080/api/user/profile?userUuid=${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("⚠️ JSON解析失败，原始返回：", text);
      }

      if (response.ok) {
        console.log("✅ 上传成功：", result);
        navigation.navigate('Step4Screen');
      } else {
        console.error("❌ 上传失败：", result);
        Alert.alert("上传失败", "请稍后再试");
      }
    } catch (err) {
      console.error("❌ 网络错误：", err);
      Alert.alert("网络错误", "无法连接服务器");
    } finally {
      setLoading(false);
    }
  };

  const canProceed =
    (profileData.nickname?.trim() ?? '').length > 0 &&
    profileData.cityId !== undefined;

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    options: string[],
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerCancel}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerConfirm}>确定</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.pickerItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backWrapper}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.label}>昵称 *</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入昵称"
        placeholderTextColor="#888"
        value={profileData.nickname ?? ''}
        onChangeText={(text) =>
          setProfileData((prev) => ({ ...prev, nickname: text }))
        }
      />

      <Text style={styles.label}>生日 *</Text>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowYearPicker(true)}>
          <Text style={styles.datePickerText}>{birthYear}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowMonthPicker(true)}>
          <Text style={styles.datePickerText}>{birthMonth}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDayPicker(true)}>
          <Text style={styles.datePickerText}>{birthDay}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedDateText}>
        选中日期: {getBirthDisplayString()}
      </Text>

      <Text style={styles.label}>所在城市 *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowCityPicker(true)}>
        <Text style={{ color: selectedCity ? '#000' : '#888' }}>
          {selectedCity?.label ?? '请选择城市'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>个人简介 (可选)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="一句话介绍自己"
        placeholderTextColor="#888"
        value={profileData.bio ?? ''}
        onChangeText={(text) =>
          setProfileData((prev) => ({ ...prev, bio: text }))
        }
        multiline
      />

      <TouchableOpacity
        disabled={!canProceed || loading}
        style={[
          styles.nextButton,
          (!canProceed || loading) && styles.disabledButton,
        ]}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>
          {loading ? '上传中…' : '下一步'}
        </Text>
        {!loading && <Ionicons name="chevron-forward" size={20} color="#fff" />}
      </TouchableOpacity>

      {renderPicker(showYearPicker, () => setShowYearPicker(false), generateYears(), setBirthYear, '选择年份')}
      {renderPicker(showMonthPicker, () => setShowMonthPicker(false), generateMonths(), setBirthMonth, '选择月份')}
      {renderPicker(showDayPicker, () => setShowDayPicker(false), generateDays(), setBirthDay, '选择日期')}
      {renderPicker(showCityPicker, () => setShowCityPicker(false), CITY_OPTIONS.map(c => c.label), (cityLabel) => {
        const selected = CITY_OPTIONS.find(c => c.label === cityLabel);
        if (selected) {
          setProfileData((prev) => ({ ...prev, cityId: selected.id }));
        }
      }, '选择城市')}
    </SafeAreaView>
  );
}
