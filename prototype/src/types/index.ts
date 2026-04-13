/**
 * ABOUTME: Core data types and interfaces based on FRD-01
 * ABOUTME: Re-exported types across the application
 */

export type AppMode = 'independent' | 'facility';
export type SensorStatus = 'online' | 'offline';
export type AlertState = 'active' | 'escalated' | 'acknowledged' | 'resolved';
export type AlertOutcome = 'real_fall' | 'false_alarm';

export interface User {
  id: string;
  phone: string;
  name?: string;
  type: 'caretaker' | 'manager';
  mode: AppMode;
  linkedHomeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Home {
  id: string;
  name: string;
  address?: string;
  createdBy: string;
  createdAt: string;
}

export interface Sensor {
  id: string;
  hardwareId: string;
  label: string;
  homeId: string;
  status: SensorStatus;
  lastHeartbeat: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  sensorId: string;
  homeId: string;
  state: AlertState;
  triggeredAt: string;
  escalatedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  outcome?: AlertOutcome;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  homeId: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: string;
}

// Navigation Param List Types
export type AuthStackParamList = {
  ModeSelection: undefined;
  PhoneAuth: undefined;
  CreateHome: undefined;
  SensorPairing: { fromSettings?: boolean };
};

export type MainTabsParamList = {
  HomeTab: undefined;
  SensorsTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
};

export type SensorsStackParamList = {
  SensorList: undefined;
  SensorDetail: { sensorId: string };
  SensorPairing: { fromSettings?: boolean };
};

export type HistoryStackParamList = {
  AlertHistory: { sensorId?: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EmergencyContacts: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  ActiveAlert: { alertId: string };
};
