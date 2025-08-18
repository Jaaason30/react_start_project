// src/screens/Step5Screen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../theme/Step5Screen.styles';

export default function Step5Screen({ navigation, route }: any) {
  const [enableNearby, setEnableNearby] = useState(true);
  const [visibleToOthers, setVisibleToOthers] = useState(true);

  const handleNext = () => {
    navigation.navigate('Step6Screen', {
      ...route.params,
      enableNearby,
      visibleToOthers,
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
        <Text style={styles.title}>定位推荐设置</Text>

        {/* 附近匹配 */}
        <View style={styles.optionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>开启附近匹配 / 活动推荐</Text>
            <Text style={styles.optionDesc}>开启后我们将根据你的位置推荐附近的活动与用户</Text>
          </View>
          <Switch
            value={enableNearby}
            onValueChange={setEnableNearby}
          />
        </View>

        {/* 是否对他人显示位置 */}
        <View style={styles.optionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>允许别人看到你的位置</Text>
            <Text style={styles.optionDesc}>关闭后你将无法在“附近的人”中被看到</Text>
          </View>
          <Switch
            value={visibleToOthers}
            onValueChange={setVisibleToOthers}
          />
        </View>

        {/* 下一步 */}
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>下一步</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
