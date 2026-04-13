import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import ModeSelectionScreen from '../screens/auth/ModeSelectionScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import CreateHomeScreen from '../screens/auth/CreateHomeScreen';
import SensorPairingScreen from '../screens/auth/SensorPairingScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const { isAuthenticated, user } = useAuthStore();
  
  // Implements FR-2.4 Re-launch Routing logic
  let initialRouteName: keyof AuthStackParamList = 'ModeSelection';
  if (isAuthenticated) {
    if (!user?.linkedHomeIds || user.linkedHomeIds.length === 0) {
      initialRouteName = 'CreateHome';
    } else {
      initialRouteName = 'SensorPairing';
    }
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="CreateHome" component={CreateHomeScreen} />
      <Stack.Screen name="SensorPairing" component={SensorPairingScreen} />
    </Stack.Navigator>
  );
}
