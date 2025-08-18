// src/screens/SeatPageScreen.tsx

import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  GestureHandlerRootView,
  TapGestureHandler,
  State as GHState,
} from 'react-native-gesture-handler';
import PlayerCard from '../components/PlayerCard';
import { seats } from '../data/seats';
import { GroupChatContext } from '../contexts/GroupChatContext';
import { Colors } from '../theme/colors';

interface Player {
  name: string;
  age: number;
  gender: 'M' | 'F';
  avatar: any;
}


const seatPlayers: Record<string, Player[]> = {
  'VIP 2': [
    { name: '李相辰', age: 25, gender: 'M', avatar: require('../assets/avatar1.jpg') },
    { name: '小美（可c，D奶）', age: 28, gender: 'F', avatar: require('../assets/avatar2.jpg') },
    { name: '老美（太老，不C）', age: 27, gender: 'M', avatar: require('../assets/avatar1.jpg') },
    { name: '徐青云', age: 26, gender: 'M', avatar: require('../assets/avatar2.jpg') },
    { name: '林小美', age: 23, gender: 'F', avatar: require('../assets/avatar1.jpg') },
    { name: '张雨晴', age: 24, gender: 'F', avatar: require('../assets/avatar2.jpg') },
    { name: '赵思琪', age: 22, gender: 'F', avatar: require('../assets/avatar1.jpg') },
    { name: '周欣怡', age: 25, gender: 'F', avatar: require('../assets/avatar2.jpg') },
  ],
};

export default function SeatPageScreen() {
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const { addToGroupChat } = useContext(GroupChatContext);

  const seatId  = route.params?.id as string;
  const seat    = seats.find(s => s.id === seatId);
  const players = seat ? seatPlayers[seat.id] : [];

  const [bumpMode,    setBumpMode]    = useState(false);
  const [highlighted, setHighlighted] = useState<Player|null>(null);

  const popupScale = useRef(new Animated.Value(0)).current;

  if (!seat) {
    return <Text style={styles.title}>未找到卡座</Text>;
  }

  // **双击切换** 碰拳模式
  const onDoubleTap = ({ nativeEvent }: any) => {
    if (nativeEvent.state === GHState.ACTIVE) {
      setBumpMode(m => !m);
      setHighlighted(null);
    }
  };

  // **打开弹窗**
  const openPopup = (p: Player) => {
    setHighlighted(p);
    popupScale.setValue(0);
    Animated.spring(popupScale, { toValue: 1, useNativeDriver: true }).start();
  };

  // **渲染玩家卡片**
  const renderItem = ({ item }: { item: Player }) => (
    <PlayerCard
      player={item}
      bumpMode={bumpMode}
      onLongPress={openPopup}
      onPunch={() => {
        // **移除动画，直接弹出提示**
        Alert.alert('碰拳', `${item.name} 碰拳！`);
      }}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TapGestureHandler numberOfTaps={2} onHandlerStateChange={onDoubleTap}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {seat.id}号卡座 {bumpMode ? '🔨 碰拳模式' : ''}
          </Text>

          <FlatList
            data={players}
            keyExtractor={p => p.name}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={renderItem}
          />

          {/* 弹窗 */}
          {highlighted && (
            <Modal transparent visible animationType="fade">
              <View style={styles.overlay}>
                <Animated.View
                  style={[
                    styles.popup,
                    { opacity: popupScale, transform: [{ scale: popupScale }] },
                  ]}
                >
                  <Text style={styles.popupName}>{highlighted.name}</Text>
                  <Text style={styles.popupAge}>{highlighted.age}岁</Text>
                  <TouchableOpacity
                    style={styles.popupButton}
                    onPress={() => {
                      addToGroupChat('Club A', [highlighted.name]);
                      setHighlighted(null);
                    }}
                  >
                    <Text style={styles.popupButtonText}>拉群聊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.popupButton}
                    onPress={() => {
                      navigation.navigate('PlayerProfile', { player: highlighted });
                      setHighlighted(null);
                    }}
                  >
                    <Text style={styles.popupButtonText}>查看资料</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setHighlighted(null)}>
                    <Text style={styles.cancelText}>取消</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Modal>
          )}
        </View>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:Colors.bg, padding:16 },
  backButton:{ color:Colors.textSecondary, marginBottom:8 },
  title:{ fontSize:20, color:Colors.text, marginBottom:12 },
  overlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.7)',
    justifyContent:'center',
    alignItems:'center',
  },
  popup:{
    width:280,
    backgroundColor:Colors.surface,
    borderRadius:12,
    padding:22,
    alignItems:'center',
  },
  popupName:{ fontSize:22, color:Colors.text, marginBottom:6 },
  popupAge:{ fontSize:16, color:Colors.textSecondary, marginBottom:14 },
  popupButton:{
    backgroundColor:Colors.primary,
    borderRadius:8,
    paddingVertical:8,
    paddingHorizontal:26,
    marginTop:8,
  },
  popupButtonText:{ color:Colors.text, fontWeight:'bold' },
  cancelText:{ color:Colors.textSecondary, marginTop:14 },
});

