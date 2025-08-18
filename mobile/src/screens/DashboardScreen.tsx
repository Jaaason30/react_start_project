/* -----------------------------------------
   DashboardScreen
   ----------------------------------------- */

import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';      // ← ⇽ 根据你的实际相对路径调整
import { GroupChatContext } from '../contexts/GroupChatContext';
import { Colors } from '../theme/colors';

/* ───────── 关键：声明额外 prop ───────── */
type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'> & {
  onLogout: () => void;
};

const DashboardScreen: React.FC<Props> = ({ navigation, onLogout }) => {
  const { groupChats } = useContext(GroupChatContext);

  /* ────── mock 数据保持不变 ────── */
  const stats = [
    { title: '本月收益', value: 12800, delta: '+12%' },
    { title: '拉新玩家', value: 128, delta: '+23%' },
    { title: '到店核销', value: 86, delta: '+15%' },
  ];

  const players = [
    {
      name: '林小姐',
      age: 25,
      sessions: 8,
      tag: '高活跃',
      avatar: require('../assets/avatar1.jpg'),
    },
    {
      name: '王小姐',
      age: 23,
      sessions: 5,
      tag: '新客',
      avatar: require('../assets/avatar2.jpg'),
    },
  ];

  const ranking = [
    { name: '你', converted: 128, rank: 1 },
    { name: 'Orii营销', converted: 96, rank: 2 },
  ];

  return (
    <View style={styles.container}>
      {/* ───────── 顶部功能按钮 ───────── */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate('SeatOverview')}
        >
          <Text style={styles.outlineButtonText}>查看卡座情况</Text>
        </TouchableOpacity>

        {/* ✅ 新增：查看广场按钮 */}
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate('Discover')}
        >
          <Text style={styles.outlineButtonText}>查看广场</Text>
        </TouchableOpacity>

        {/* 退出登录：先调 onLogout 清空全局状态，再跳回 Login */}
        <TouchableOpacity
          style={styles.outlineDangerButton}
          onPress={() => {
            onLogout();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.outlineButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>

      {/* ───────── 数据看板 ───────── */}
      <Text style={styles.sectionTitle}>数据看板</Text>
      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.title} style={styles.statCard}>
            <Text style={styles.statTitle}>{s.title}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statDelta}>{s.delta}</Text>
          </View>
        ))}
      </View>

      {/* ───────── 我的玩家池 ───────── */}
      <Text style={styles.sectionTitle}>我的玩家池</Text>
      <FlatList
        data={players}
        horizontal
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <Image source={item.avatar} style={styles.avatar} />
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.playerDetail}>
              {item.age}岁 · {item.sessions}局
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.tag}</Text>
            </View>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />

      {/* ───────── 营销排行榜 ───────── */}
      <Text style={styles.sectionTitle}>营销排行榜</Text>
      {ranking.map((r) => (
        <View key={r.rank} style={styles.rankItem}>
          <Text style={styles.rankText}>
            {r.name} 转化 {r.converted} 位
          </Text>
          <Text style={styles.rankBadge}>{r.rank}</Text>
        </View>
      ))}

      {/* ───────── 群聊列表 ───────── */}
      <Text style={styles.sectionTitle}>群聊列表</Text>
      {groupChats.length === 0 ? (
        <Text style={styles.emptyText}>暂无群聊</Text>
      ) : (
        groupChats.map((chat) => (
          <Text key={chat.id} style={styles.chatItem}>
            {chat.club}:{chat.members.join(',')}
          </Text>
        ))
      )}
    </View>
  );
};

export default DashboardScreen;

/* -----------------------------------------
   样式保持不变
   ----------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 16 },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  outlineButton: {
    borderColor: Colors.primary,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  outlineDangerButton: {
    borderColor: Colors.danger,
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  outlineButtonText: { color: Colors.text },
  sectionTitle: { fontSize: 20, color: Colors.text, marginVertical: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },
  statTitle: { color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, color: Colors.text },
  statDelta: { color: Colors.success },
  playerCard: {
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  playerName: { color: Colors.text },
  playerDetail: { color: Colors.textSecondary, fontSize: 12 },
  badge: {
    marginTop: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: { color: Colors.text, fontSize: 10 },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  rankText: { color: Colors.text },
  rankBadge: {
    backgroundColor: Colors.primary,
    color: Colors.text,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  emptyText: { color: Colors.textSecondary, marginVertical: 8 },
  chatItem: { color: Colors.text, marginVertical: 4 },
});
