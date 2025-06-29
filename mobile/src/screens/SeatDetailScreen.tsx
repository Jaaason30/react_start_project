// src/screens/SeatDetailScreen.tsx
import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../theme/colors';

interface Player {
  name: string;
  age: number;
  gender: 'M' | 'F';
  avatar: any;
}

interface Seat {
  id: string;
  total: number;
  male: number;
  female: number;
  tag: string;
  color: string;
}

interface Props {
  seat: Seat;
  visible: boolean;
  onClose: () => void;
}

export default function SeatDetailScreen({ seat, visible, onClose }: Props) {
  const players: Player[] = [
    { name: '陈志强', age: 25, gender: 'M', avatar: require('../assets/avatar1.jpg') },
    { name: '王浩然', age: 28, gender: 'M', avatar: require('../assets/avatar2.jpg') },
    // 其他补满seat.total人
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.background} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <Text style={styles.title}>{seat.id}号卡座</Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>{seat.total}人</Text>
            <Text style={styles.badge}>{seat.male}男 {seat.female}女</Text>
            <Text style={styles.badge}>可入座 {Math.max(0, 10-seat.total)} 位</Text>
          </View>

          <FlatList
            data={players}
            keyExtractor={p => p.name}
            renderItem={({ item }) => (
              <View style={styles.playerItem}>
                <Image source={item.avatar} style={styles.avatar} />
                <Text style={styles.playerText}>{item.name} ({item.age}岁)</Text>
              </View>
            )}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: 350,
    maxHeight: '80%',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    color: Colors.text,
    fontSize: 20,
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: Colors.secondary,
    color: Colors.text,
    padding: 5,
    margin: 3,
    borderRadius: 10,
    fontSize: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  playerText: {
    color: Colors.text,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeText: {
    textAlign: 'center',
    color: Colors.text,
  },
});
