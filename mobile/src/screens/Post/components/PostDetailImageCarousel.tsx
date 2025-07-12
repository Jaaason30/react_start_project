// src/screens/Post/components/PostDetailImageCarousel.tsx
import React from 'react';
import { FlatList, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { styles } from '../../../theme/PostDetailScreen.styles';

interface PostDetailImageCarouselProps {
  images: string[];
  imageDimensions: { width: number; height: number }[];
}

const { width: screenWidth } = Dimensions.get('window');

const PostDetailImageCarousel: React.FC<PostDetailImageCarouselProps> = ({
  images,
  imageDimensions,
}) => (
  <FlatList
    horizontal
    data={images}
    keyExtractor={(_, idx) => String(idx)}
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    renderItem={({ item, index }) => {
      const dims = imageDimensions[index] || { width: screenWidth, height: screenWidth };
      const height = (dims.height / dims.width) * screenWidth;
      return (
        <FastImage
          source={{ uri: item }}
          style={[styles.image, { height }]}
          resizeMode={FastImage.resizeMode.contain}
        />
      );
    }}
  />
);

export default PostDetailImageCarousel;
