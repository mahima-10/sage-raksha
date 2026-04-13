import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, List, History, Settings } from 'lucide-react-native';

import { theme } from '../constants/theme';
import { 
  MainTabsParamList, 
  HomeStackParamList, 
  SensorsStackParamList, 
  HistoryStackParamList, 
  SettingsStackParamList 
} from '../types';

import DashboardScreen from '../screens/main/DashboardScreen';
import SensorListScreen from '../screens/main/SensorListScreen';
import SensorDetailScreen from '../screens/main/SensorDetailScreen';
import SensorPairingScreen from '../screens/auth/SensorPairingScreen'; // Reuse form
import AlertHistoryScreen from '../screens/main/AlertHistoryScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EmergencyContactsScreen from '../screens/main/EmergencyContactsScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
    </HomeStack.Navigator>
  );
}

const SensorsStack = createNativeStackNavigator<SensorsStackParamList>();
function SensorsNavigator() {
  return (
    <SensorsStack.Navigator screenOptions={{ headerShown: false }}>
      <SensorsStack.Screen name="SensorList" component={SensorListScreen} />
      <SensorsStack.Screen name="SensorDetail" component={SensorDetailScreen} />
      <SensorsStack.Screen name="SensorPairing" component={SensorPairingScreen} />
    </SensorsStack.Navigator>
  );
}

const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
function HistoryNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="AlertHistory" component={AlertHistoryScreen} />
    </HistoryStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
    </SettingsStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeNavigator} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="SensorsTab" 
        component={SensorsNavigator}
        options={{
          tabBarLabel: 'Sensors',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="HistoryTab" 
        component={HistoryNavigator}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsNavigator} 
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
}
