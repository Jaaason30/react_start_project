import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { styles } from '../../../../theme/PostDetailScreen.styles';
import { PostType } from '../../types';

const { width } = Dimensions.get('window');

interface PostContentProps {
  post: PostType;
}

export const PostContent: React.FC<PostContentProps> = ({ post }) => {
  const [imageDimensions, setImageDimensions] = useState<
    { width: number; height: number }[]
  >([]);

  useEffect(() => {
    if (!post?.images?.length) return;
    (async () => {
      const dims = await Promise.all(
        post.images.map(
          url =>
            new Promise<{ width: number; height: number }>(resolve => {
              Image.getSize(
                url,
                (w, h) => resolve({ width: w, height: h }),
                () => resolve({ width, height: width })
              );
            })
        )
      );
      setImageDimensions(dims);
    })();
  }, [post?.images]);

  return (
    <>
      <FlatList
        horizontal
        data={post.images}
        keyExtractor={(_, idx) => String(idx)}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <FastImage
            source={{ uri: item }}
            style={[
              styles.image,
              {
                height:
                  (imageDimensions[index]?.height /
                    imageDimensions[index]?.width) *
                  width,
              },
            ]}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>
          {post.content || '暂无内容'}
        </Text> 
      </View>
    </>
  );
};