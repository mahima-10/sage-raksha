import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ActiveAlertScreen from '../screens/main/ActiveAlertScreen';

import { useAuthStore } from '../store/authStore';
import { useHomeStore } from '../store/homeStore';
import { useSensorStore } from '../store/sensorStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const { getHomeById } = useHomeStore();
  const { getSensorsByHomeId } = useSensorStore();

  const isFullyOnboarded = 
    isAuthenticated && 
    user && 
    user.linkedHomeIds.length > 0 && 
    getSensorsByHomeId(user.linkedHomeIds[0]).length > 0;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isFullyOnboarded ? (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
        
        {/* Active Alert is a full-screen modal accessible from anywhere */}
        <Stack.Screen 
          name="ActiveAlert" 
          component={ActiveAlertScreen} 
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
