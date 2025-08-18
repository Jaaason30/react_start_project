import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectFromGallery, takePhoto } from '../utils/imagePickerHelpers';
import { PostType } from '../../types';
import type { RootStackParamList } from '../../../../App';

type DiscoverNav = NativeStackNavigationProp<RootStackParamList, 'Discover'>;

export const usePostActions = (onPostSuccess: (post: PostType) => void) => {
  const navigation = useNavigation<DiscoverNav>();
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleSelectFromGallery = useCallback(() => {
    setSheetVisible(false);
    selectFromGallery(images => {
      navigation.navigate('PostCreation', {
        source: 'gallery',
        images,
        onPostSuccess,
      });
    });
  }, [navigation, onPostSuccess]);

  const handleTakePhoto = useCallback(() => {
    setSheetVisible(false);
    takePhoto(image => {
      navigation.navigate('PostCreation', {
        source: 'camera',
        images: [image],
        onPostSuccess,
      });
    });
  }, [navigation, onPostSuccess]);

  const handleTextPost = useCallback(() => {
    setSheetVisible(false);
    navigation.navigate('WriteText', {
      source: 'text',
      onPostSuccess,
    });
  }, [navigation, onPostSuccess]);

  const handleTemplatePost = useCallback(() => {
    setSheetVisible(false);
    navigation.navigate('PostCreation', {
      source: 'template',
      onPostSuccess,
    });
  }, [navigation, onPostSuccess]);

  return {
    sheetVisible,
    setSheetVisible,
    handleSelectFromGallery,
    handleTakePhoto,
    handleTextPost,
    handleTemplatePost,
  };
};
