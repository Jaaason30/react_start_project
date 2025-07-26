import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from '../../../../theme/DiscoverScreen.styles';
import { PostType } from '../../types';
import { RootStackParamList } from '../../../../App';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface PostCardProps {
  item: PostType;
  onDeleteSuccess?: (postUuid: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ item, onDeleteSuccess }) => {
  const navigation = useNavigation<Navigation>();
  const { avatarVersion } = useUserProfile();
  const [uri, setUri] = useState(item.images[0] || 'https://via.placeholder.com/400x600');

  useEffect(() => {
    setUri(item.images[0] || 'https://via.placeholder.com/400x600');
  }, [item.images]);

  const goProfile = () => {
    if (item.author.shortId != null) {
      navigation.navigate('PlayerProfile', { shortId: item.author.shortId });
    } else {
      navigation.navigate('PlayerProfile', { userId: String(item.author.shortId) });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PostDetail', { 
        post: item,
        onDeleteSuccess
      })}
    >
      <FastImage
        source={{ uri }}
        style={styles.cardImage}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => setUri('https://via.placeholder.com/400x600')}
      />
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title || '（无标题）'}
      </Text>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.authorContainer} onPress={goProfile} activeOpacity={0.7}>
          <FastImage
            key={`${item.author.shortId}-${avatarVersion}`}
            source={{ uri: item.author.profilePictureUrl || '' }}
            style={styles.authorAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <Text style={styles.author}>{item.author.nickname}</Text>
        </TouchableOpacity>
        <View style={styles.likesRow}>
          <Ionicons name="heart-outline" size={14} color="#888" />
          <Text style={styles.likesText}>{item.likeCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};