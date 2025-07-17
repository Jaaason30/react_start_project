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
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/Step3Screen.styles';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { apiClient } from '../../services/apiClient';

/**
 * 固定城市选项（可改为服务端下发）
 */
const CITY_OPTIONS = [
  { name: '北京' },
  { name: '上海' },
  { name: '广州' },
  { name: '深圳' },
  { name: '杭州' },
  { name: '成都' },
  { name: '重庆' },
  { name: '武汉' },
  { name: '西安' },
  { name: '南京' },
];

export default function Step3Screen({ navigation }: any) {
  const { profileData, setProfileData, isLoading } = useUserProfile();
  const [submitting, setSubmitting] = useState(false); // 防连点即可，不做等待

  // 尚未加载 profile 时的兜底 UI
  if (isLoading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ====== 本地生日状态（字符串 YYYY-MM-DD 拆分） ======
  const currentYear = new Date().getFullYear();
  const defaultYear = (currentYear - 25).toString();
  const defaultMonth = '01';
  const defaultDay = '01';
  const initialBirth = profileData.dateOfBirth ?? `${defaultYear}-${defaultMonth}-${defaultDay}`;
  const [birthYear, setBirthYear] = useState(initialBirth.split('-')[0]);
  const [birthMonth, setBirthMonth] = useState(initialBirth.split('-')[1]);
  const [birthDay, setBirthDay] = useState(initialBirth.split('-')[2]);

  // ====== Picker 可见性 ======
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // 安卓物理返回键
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  // ====== Picker 选项生成 ======
  const generateYears = () =>
    Array.from({ length: currentYear - 1949 }, (_, i) => (currentYear - i).toString());
  const generateMonths = () => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const generateDays = () => {
    const daysInMonth = new Date(parseInt(birthYear, 10), parseInt(birthMonth, 10), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
  };

  const getBirthDisplayString = () => `${birthYear}-${birthMonth}-${birthDay}`;
  const selectedCityName = profileData.city?.name;

  /**
   * 下一步（乐观）：
   * 1. 立即更新本地 Context
   * 2. 立即跳转下一步，不等待网络
   * 3. 后台异步 PATCH /api/user/me（通过 JWT 拿当前用户，无需 uuid/shortId query param）
   */
  const handleNext = () => {
    if (submitting) return;
    setSubmitting(true);

    const dateOfBirth = getBirthDisplayString();
    // 本地更新
    setProfileData({ ...profileData, dateOfBirth });

    // 立即跳转，不等后端
    navigation.navigate('Step4Screen');

    // 后台异步发送，利用 JWT 识别当前用户
    const payload = {
      nickname: profileData.nickname ?? '',
      bio: profileData.bio ?? '',
      dateOfBirth,
      city: selectedCityName ? { name: selectedCityName } : undefined,
      gender: profileData.gender?.text ? { text: profileData.gender.text } : undefined,
      genderPreferences: profileData.genderPreferences?.length
        ? profileData.genderPreferences.map(g => ({ text: g.text }))
        : undefined,
      interests: profileData.interests ?? [],
      preferredVenues: profileData.preferredVenues ?? [],
      profileBase64: profileData.profileBase64,
      profileMime: profileData.profileMime,
      albumBase64List: profileData.albumBase64List,
      albumMimeList: profileData.albumMimeList,
    };

    apiClient
      .patch('/api/user/me', payload)
      .then(({ status, error }) => {
        if (error) {
          console.error('❌ Step3 上传失败：', error);
          // 这里不打断用户流程，可考虑在 Step4 做统一提示
        } else {
          console.log('✅ Step3 上传成功，status=', status);
        }
      })
      .catch(err => {
        console.error('❌ Step3 网络错误：', err);
      })
      .finally(() => {
        // 屏幕已跳走，此状态仅防多次点击
        setSubmitting(false);
      });
  };

  const canProceed = !!profileData.nickname?.trim() && !!selectedCityName;

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    options: string[],
    onSelect: (v: string) => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              >
                <Text style={styles.pickerItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 返回 */}
      <TouchableOpacity style={styles.backWrapper} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      {/* 昵称 */}
      <Text style={styles.label}>昵称 *</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入昵称"
        placeholderTextColor="#888"
        value={profileData.nickname}
        onChangeText={t => setProfileData({ ...profileData, nickname: t })}
      />

      {/* 生日 */}
      <Text style={styles.label}>生日 *</Text>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={() => setShowYearPicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{birthYear}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{birthMonth}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDayPicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{birthDay}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedDateText}>选中日期: {getBirthDisplayString()}</Text>

      {/* 城市 */}
      <Text style={styles.label}>所在城市 *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowCityPicker(true)}>
        <Text style={{ color: selectedCityName ? '#fff' : '#888' }}>
          {selectedCityName ?? '请选择城市'}
        </Text>
      </TouchableOpacity>

      {/* 个人简介 */}
      <Text style={styles.label}>个人简介 (可选)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="一句话介绍自己"
        placeholderTextColor="#888"
        value={profileData.bio}
        onChangeText={t => setProfileData({ ...profileData, bio: t })}
        multiline
      />

      {/* 下一步按钮 */}
      <TouchableOpacity
        disabled={!canProceed || submitting}
        style={[styles.nextButton, (!canProceed || submitting) && styles.disabledButton]}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>下一步</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* 弹窗选择 */}
      {renderPicker(showYearPicker, () => setShowYearPicker(false), generateYears(), setBirthYear, '选择年份')}
      {renderPicker(showMonthPicker, () => setShowMonthPicker(false), generateMonths(), setBirthMonth, '选择月份')}
      {renderPicker(showDayPicker, () => setShowDayPicker(false), generateDays(), setBirthDay, '选择日期')}
      {renderPicker(
        showCityPicker,
        () => setShowCityPicker(false),
        CITY_OPTIONS.map(c => c.name),
        name => setProfileData({ ...profileData, city: { name } }),
        '选择城市'
      )}
    </SafeAreaView>
  );
}
