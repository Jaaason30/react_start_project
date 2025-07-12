import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../theme/colors';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const navigation = useNavigation();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigation.navigate('Login' as never);
    }
  }, [isInitialized, isAuthenticated, navigation]);

  if (!isInitialized) {
    return fallback || (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});