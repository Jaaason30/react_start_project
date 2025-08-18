// src/components/DiscoverBanner.tsx

import React, { useState } from 'react';
import { View, ScrollView, Image, Dimensions } from 'react-native';
import { styles } from '../../theme/DiscoverScreen.styles';

const { width } = Dimensions.get('window');

const mockBanners = [
  { id: 'b1', uri: 'https://picsum.photos/800/300' },
  { id: 'b2', uri: 'https://picsum.photos/801/300' },
  { id: 'b3', uri: 'https://picsum.photos/802/300' },
];

export const DiscoverBanner: React.FC = () => {
  const [bannerIndex, setBannerIndex] = useState(0);

  return (
    <View style={styles.bannerBox}>
      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        snapToAlignment="center"
        onScroll={({ nativeEvent }) => {
          const idx = Math.round(nativeEvent.contentOffset.x / width);
          setBannerIndex(idx);
        }}
        scrollEventThrottle={16}
      >
        {mockBanners.map(b => (
          <Image
            key={b.id}
            source={{ uri: b.uri }}
            style={styles.banner}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.dotsWrap}>
        {mockBanners.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, bannerIndex === i && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};
