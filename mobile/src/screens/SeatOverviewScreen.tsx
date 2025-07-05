import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { seats } from '../data/seats';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatOverview'>;

export default function SeatOverviewScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>卡座实时情况</Text>
      <TextInput
        placeholder="搜索卡座号或玩家昵称"
        placeholderTextColor={Colors.textSecondary}
        style={styles.input}
      />

      <FlatList
        data={seats}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderColor: item.color }]}
            onPress={() => navigation.navigate('SeatPage', { id: item.id })}
          >
            <Text style={styles.cardTitle}>{item.id}</Text>
            <Text style={styles.cardText}>{item.male}男 / {item.female}女</Text>
            <Text style={[styles.tag, { backgroundColor: item.color }]}>{item.tag}</Text>
          </TouchableOpacity>
        )}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#111',
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    width: '48%',
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    marginBottom: 4,
  },
  cardText: {
    color: Colors.textSecondary,
  },
  tag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    color: Colors.text,
  },
});
