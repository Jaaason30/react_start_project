import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProfileProvider } from './contexts/UserProfileContext';

// Import all screen components
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import SeatOverviewScreen from './screens/SeatOverviewScreen';
import SeatPageScreen from './screens/SeatPageScreen';
import PlayerProfileScreen from './screens/Profile/PlayerProfileScreen';
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

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SeatOverview: undefined;
  SeatPage: undefined;
  Discover: undefined;
  PostDetail: undefined;
  PostCreation: undefined;
  CertifiedPromotions: undefined;
  Step1Screen: undefined;
  Step2Screen: undefined;
  Step3Screen: undefined;
  Step4Screen: undefined;
  Step5Screen: undefined;
  Step6Screen: undefined;
  PlayerProfile: undefined;
};

// Add type definition for login props
interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

// Add type definition for dashboard props
interface DashboardProps {
  onLogout: () => void;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const handleLoginSuccess = (username: string) => setUser(username);
  const handleLogout = () => setUser(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProfileProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName={user ? "Dashboard" : "Register"}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Dashboard">
              {(props) => (
                user ? <DashboardScreen {...props} onLogout={handleLogout} /> : 
                <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
              )}
            </Stack.Screen>
            <Stack.Screen name="SeatOverview" component={SeatOverviewScreen} />
            <Stack.Screen name="SeatPage" component={SeatPageScreen} />
            <Stack.Screen name="Discover" component={DiscoverScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="PostCreation" component={PostCreationScreen} />
            <Stack.Screen name="CertifiedPromotions" component={CertifiedPromotionsScreen} />
            <Stack.Screen name="Step1Screen" component={Step1Screen} />
            <Stack.Screen name="Step2Screen" component={Step2Screen} />
            <Stack.Screen name="Step3Screen" component={Step3Screen} />
            <Stack.Screen name="Step4Screen" component={Step4Screen} />
            <Stack.Screen name="Step5Screen" component={Step5Screen} />
            <Stack.Screen name="Step6Screen" component={Step6Screen} />
            <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProfileProvider>
    </GestureHandlerRootView>
  );
}