// App.tsx
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import tokenManager from './services/tokenManager';
import { Colors } from './theme/colors';
import WriteTextScreen from './screens/Post/WriteTextScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import SeatOverviewScreen from './screens/SeatOverviewScreen';
import SeatPageScreen from './screens/SeatPageScreen';
import PlayerProfileScreen from './screens/Profile/PlayerProfileScreen';
import EditProfileScreen from './screens/Profile/EditProfileScreen'; 
import DiscoverScreen from './screens/Post/DiscoverScreen';
import PostDetailScreen from './screens/Post/PostDetailScreen';
import PostCreationScreen from './screens/Post/PostCreationScreen';
import CertifiedPromotionsScreen from './screens/Seller/CertifiedPromotionsScreen';
import Step1Screen from './screens/Info/Step1Screen';
import Step2Screen from './screens/Info/Step2Screen';
import Step3Screen from './screens/Info/Step3Screen';
import Step4Screen from './screens/Info/Step4Screen';
import Step5Screen from './screens/Info/Step5Screen';
import Step6Screen from './screens/Info/Step6Screen';
import SearchScreen from './screens/Post/SearchScreen';
import { PostType } from './screens/Post/types';
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SeatOverview: undefined;
  SeatPage: { id: string };
  Discover: undefined;
  Search: undefined;
  PostDetail: {
    post: { uuid: string };
    onDeleteSuccess?: (postUuid: string) => void;
  };
  PostCreation: {
    source: 'gallery' | 'camera' | 'template' | 'text';
    images?: string[];
    onPostSuccess?: (newPost: PostType) => void;
  };
  WriteText: {
    source: 'text';
    onPostSuccess?: (newPost: PostType) => void;
  };
  CertifiedPromotions: undefined;
  Step1Screen: undefined;
  Step2Screen: undefined;
  Step3Screen: undefined;
  Step4Screen: undefined;
  Step5Screen: undefined;
  Step6Screen: undefined;
  PlayerProfile: { shortId?: number; userId?: string };
  EditProfile: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await tokenManager.init();
        setIsAuthenticated(tokenManager.isAuthenticated());
      } catch (e) {
        console.error('Auth init error', e);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAuthSuccess = () => setIsAuthenticated(true);
  const handleLogout = async () => {
    await tokenManager.clearTokens();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProfileProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
            screenOptions={{ headerShown: false }}
          >
            {/* Auth flows always registered */}
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} onLoginSuccess={handleAuthSuccess} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => (
                <RegisterScreen
                  {...props}
                  onRegisterSuccess={handleAuthSuccess}
                />
              )}
            </Stack.Screen>

            {/* Main app */}
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardScreen {...props} onLogout={handleLogout} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="SeatOverview"
              component={SeatOverviewScreen}
            />
            <Stack.Screen name="SeatPage" component={SeatPageScreen} />
            <Stack.Screen name="Discover" component={DiscoverScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen
              name="PostCreation"
              component={PostCreationScreen}
            />
            <Stack.Screen name="WriteText" component={WriteTextScreen} />
            <Stack.Screen
              name="CertifiedPromotions"
              component={CertifiedPromotionsScreen}
            />
            <Stack.Screen name="Step1Screen" component={Step1Screen} />
            <Stack.Screen name="Step2Screen" component={Step2Screen} />
            <Stack.Screen name="Step3Screen" component={Step3Screen} />
            <Stack.Screen name="Step4Screen" component={Step4Screen} />
            <Stack.Screen name="Step5Screen" component={Step5Screen} />
            <Stack.Screen name="Step6Screen" component={Step6Screen} />
            <Stack.Screen
              name="PlayerProfile"
              component={PlayerProfileScreen}
            />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProfileProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
});
