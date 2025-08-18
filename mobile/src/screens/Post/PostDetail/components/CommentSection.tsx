import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../theme/PostDetailScreen.styles';
import { SortType } from '../../types';

interface CommentSectionProps {
  activeSort: SortType;
  onSortChange: (sort: SortType) => void;
  onLayout: (y: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  activeSort,
  onSortChange,
  onLayout,
}) => {
  return (
    <View
      onLayout={e => onLayout(e.nativeEvent.layout.y)}
      style={styles.commentHeader}
    >
      <Text style={styles.commentHeaderText}>
        全部评论
      </Text>
      <View style={styles.commentTabs}>
        {(['最新', '最热'] as SortType[]).map(t => (
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
};