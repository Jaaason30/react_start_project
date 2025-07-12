// src/screens/Post/components/PostDetailCommentHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { styles } from '../../../theme/PostDetailScreen.styles';

interface PostDetailCommentHeaderProps {
  activeSort: '最新' | '最热';
  onSortChange: (sort: '最新' | '最热') => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const PostDetailCommentHeader: React.FC<PostDetailCommentHeaderProps> = ({
  activeSort,
  onSortChange,
  onLayout,
}) => (
  <View onLayout={onLayout} style={styles.commentHeader}>
    <Text style={styles.commentHeaderText}>全部评论</Text>
    <View style={styles.commentTabs}>
      {(['最新', '最热'] as const).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onSortChange(t)}
          style={[
            styles.commentTab,
            activeSort === t && styles.activeCommentTab,
          ]}
        >
          <Text
            style={[
              styles.commentTabText,
              activeSort === t && styles.activeCommentTabText,
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default PostDetailCommentHeader;
