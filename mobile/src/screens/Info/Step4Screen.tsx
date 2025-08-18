import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/Step4Screen.styles';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker'; // Import the types

export default function Step4Screen({ navigation, route }: any) {
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const pickSelfie = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('用户取消了选择图片');
        } else if (response.errorCode) {
          console.log('ImagePicker 错误: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          // Safely access the uri property
          const uri = response.assets[0]?.uri;
          if (uri) {
            setSelfieUri(uri);
          }
        }
      }
    );
  };

  const handleNext = () => {
    navigation.navigate('Step5Screen', {
      ...route.params,
      selfieUri,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 返回按钮 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backWrapper}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <Text style={styles.title}>自拍认证（可跳过）</Text>

        {/* 自拍上传卡片 */}
        <TouchableOpacity
          style={styles.certCard}
          onPress={pickSelfie}
        >
          <Text style={styles.certTitle}>📸 上传自拍照</Text>
          {selfieUri ? (
            <Image source={{ uri: selfieUri }} style={styles.certImage} />
          ) : (
            <Text style={styles.certHint}>点击上传，提升曝光</Text>
          )}
        </TouchableOpacity>

        {/* 下一步 */}
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextText}>下一步</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* 跳过按钮 */}
        <TouchableOpacity
          onPress={handleNext}
          style={{ marginTop: 16, alignSelf: 'center' }}
        >
          <Text style={{ color: '#888' }}>跳过此步骤</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}