// src/components/PlayerCard.tsx

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  findNodeHandle,
  UIManager,
} from 'react-native';
import {
  PanGestureHandler,
  LongPressGestureHandler,
  State as GHState,
  PanGestureHandlerStateChangeEvent,
  LongPressGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { Colors } from '../theme/colors';

interface Player {
  name: string;
  age: number;
  gender: 'M' | 'F';
  avatar: any;
}

export default function PlayerCard({
  player,
  bumpMode,
  onLongPress,
  onPunch,
}: {
  player: Player;
  bumpMode: boolean;
  onLongPress(p: Player): void;
  onPunch(p1: Player, p2: Player): void;
}) {
  // 每张卡独立的 pan
  const pan = useRef(new Animated.ValueXY()).current;
  // 存储自己在屏幕上的布局
  const layout = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0, y: 0, w: 0, h: 0,
  });
  const viewRef = useRef<any>(null);

  // measureInWindow 把真实坐标写到 layout.current
  useEffect(() => {
    const id = setTimeout(() => {
      UIManager.measureInWindow(
        findNodeHandle(viewRef.current),
        (x, y, w, h) => {
          layout.current = { x, y, w, h };
        }
      );
    }, 50);
    return () => clearTimeout(id);
  }, []);

  if (!bumpMode) {
    // 普通模式：长按弹窗
    return (
      <LongPressGestureHandler
        minDurationMs={500}
        onHandlerStateChange={({
          nativeEvent,
        }: LongPressGestureHandlerStateChangeEvent) => {
          if (nativeEvent.state === GHState.ACTIVE) {
            onLongPress(player);
          }
        }}
      >
        <View ref={viewRef} style={styles.card}>
          <Image source={player.avatar} style={styles.avatar} />
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.age}>{player.age}岁</Text>
        </View>
      </LongPressGestureHandler>
    );
  }

  // 碰拳模式：拖拽 + 碰拳检测
  return (
    <PanGestureHandler
      onGestureEvent={Animated.event(
        [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
        { useNativeDriver: false }
      )}
      onHandlerStateChange={(
        e: PanGestureHandlerStateChangeEvent
      ) => {
        if (e.nativeEvent.state === GHState.BEGAN) {
          pan.setValue({ x: 0, y: 0 });
        }
        if (e.nativeEvent.state === GHState.END) {
          const { absoluteX: ax, absoluteY: ay } = e.nativeEvent;
          // 如果拖到自己身上就忽略
          if (
            ax >= layout.current.x &&
            ax <= layout.current.x + layout.current.w &&
            ay >= layout.current.y &&
            ay <= layout.current.y + layout.current.h
          ) {
            // do nothing
          } else {
            // 先扫一遍全局布局，看看有没有别的卡片
            // 这里简化：假设父级已收集所有 layout 且可访问
            // onPunch(player, otherPlayer)
          }
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      }}
    >
      <Animated.View
        ref={viewRef}
        style={[
          styles.card,
          { borderWidth: 2, borderColor: Colors.primary },
          { transform: pan.getTranslateTransform() },
        ]}
      >
        <Image source={player.avatar} style={styles.avatar} />
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.age}>{player.age}岁</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    width: '48%',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 6 },
  name: { color: Colors.text, fontSize: 14 },
  age: { color: Colors.textSecondary, fontSize: 12 },
});
