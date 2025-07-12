// src/screens/Post/components/PostDetailContent.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../theme/PostDetailScreen.styles';

interface PostDetailContentProps {
  title: string;
  body: string;
}

const PostDetailContent: React.FC<PostDetailContentProps> = ({ title, body }) => (
  <View style={styles.contentContainer}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body || '暂无内容'}</Text>
  </View>
);

export default PostDetailContent;