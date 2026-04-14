/**
 * ABOUTME: Mock data for the Phase 1 prototype according to FRD-10
 * ABOUTME: Includes home, user, sensors, contacts, and historical alerts
 */
import { User, Home, Sensor, Alert, EmergencyContact } from '../types';

export const MOCK_USER: User = {
  id: 'u-1',
  phone: '9876543210',
  name: 'Ananya',
  type: 'caretaker',
  mode: 'independent',
  linkedHomeIds: ['h-1'],
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-04-10T12:00:00Z',
};

// Additional CARETAKER for display (not the primary logged-in user)
export const MOCK_LINKED_CARETAKERS: User[] = [
  MOCK_USER,
  {
    id: 'u-2',
    name: 'Rohan',
    phone: '9876543211',
    type: 'caretaker',
    mode: 'independent',
    linkedHomeIds: ['h-1'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-04-10T12:00:00Z',
  },
];

export const MOCK_HOME: Home = {
  id: 'h-1',
  name: "Mom's House",
  address: '123 Main St, Springfield',
  createdBy: 'u-1',
  createdAt: '2026-01-01T10:00:00Z',
};

export const MOCK_SENSORS: Sensor[] = [
  {
    id: 's-1',
    hardwareId: 'SEN-ABC123',
    label: "Mom's Bathroom",
    homeId: 'h-1',
    status: 'online',
    lastHeartbeat: new Date(Date.now() - 30000).toISOString(), // 30s ago
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 's-2',
    hardwareId: 'SEN-DEF456',
    label: 'Hall Bathroom',
    homeId: 'h-1',
    status: 'offline',
    lastHeartbeat: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: '2026-01-15T09:05:00Z',
  },
];

export const MOCK_CONTACTS: EmergencyContact[] = [
  {
    id: 'c-1',
    homeId: 'h-1',
    name: 'Mrs. Sharma',
    phone: '9876543212',
    relationship: 'Neighbor',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'c-2',
    homeId: 'h-1',
    name: 'Rohan',
    phone: '9876543211',
    relationship: 'Sibling',
    createdAt: '2026-01-15T10:05:00Z',
  },
];

// Resolved alerts + 1 active alert for testing
export const MOCK_ALERTS: Alert[] = [
  // The active one for testing
  {
    id: 'a-0',
    sensorId: 's-1',
    homeId: 'h-1',
    alertType: 'fall',
    state: 'active',
    triggeredAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
  },
  // Resolved fall alerts
  {
    id: 'a-1',
    sensorId: 's-1',
    homeId: 'h-1',
    alertType: 'fall',
    state: 'resolved',
    triggeredAt: '2026-04-10T14:34:00Z',
    acknowledgedAt: '2026-04-10T14:34:45Z',
    acknowledgedBy: 'u-1',
    resolvedAt: '2026-04-10T14:45:00Z',
    resolvedBy: 'u-1',
    outcome: 'real_fall',
    notes: 'Mom slipped on the wet floor, but is doing fine now.',
  },
  {
    id: 'a-2',
    sensorId: 's-1',
    homeId: 'h-1',
    alertType: 'fall',
    state: 'resolved',
    triggeredAt: '2026-04-08T11:15:00Z',
    resolvedAt: '2026-04-08T11:15:10Z',
    resolvedBy: 'u-2',
    outcome: 'false_alarm',
    notes: '',
  },
  {
    id: 'a-3',
    sensorId: 's-2',
    homeId: 'h-1',
    alertType: 'fall',
    state: 'resolved',
    triggeredAt: '2026-04-03T21:00:00Z',
    acknowledgedAt: '2026-04-03T21:00:30Z',
    acknowledgedBy: 'u-1',
    resolvedAt: '2026-04-03T21:10:00Z',
    resolvedBy: 'u-1',
    outcome: 'real_fall',
    notes: 'Found her on the floor. Called the doctor.',
  },
  {
    id: 'a-4',
    sensorId: 's-1',
    homeId: 'h-1',
    alertType: 'fall',
    state: 'resolved',
    triggeredAt: '2026-03-28T08:30:00Z',
    acknowledgedAt: '2026-03-28T08:31:00Z',
    acknowledgedBy: 'u-2',
    resolvedAt: '2026-03-28T08:32:00Z',
    resolvedBy: 'u-2',
    outcome: 'false_alarm',
    notes: 'Triggered by the shower curtain moving.',
  },
  {
    id: 'a-5',
    sensorId: 's-2',
    homeId: 'h-1',
    alertType: 'fall',
    state: 'resolved',
    triggeredAt: '2026-03-20T16:45:00Z',
    acknowledgedAt: '2026-03-20T16:46:00Z',
    acknowledgedBy: 'u-1',
    resolvedAt: '2026-03-20T16:50:00Z',
    resolvedBy: 'u-1',
    outcome: 'false_alarm',
    notes: 'Dropped a heavy towel.',
  },
  // Resolved stillness alerts
  {
    id: 'a-6',
    sensorId: 's-1',
    homeId: 'h-1',
    alertType: 'stillness',
    state: 'resolved',
    triggeredAt: '2026-04-09T09:20:00Z',
    acknowledgedAt: '2026-04-09T09:21:30Z',
    acknowledgedBy: 'u-1',
    resolvedAt: '2026-04-09T09:25:00Z',
    resolvedBy: 'u-1',
    outcome: 'false_alarm',
    notes: 'Person was asleep in the bathroom.',
  },
  {
    id: 'a-7',
    sensorId: 's-2',
    homeId: 'h-1',
    alertType: 'stillness',
    state: 'resolved',
    triggeredAt: '2026-04-06T17:05:00Z',
    acknowledgedAt: '2026-04-06T17:06:00Z',
    acknowledgedBy: 'u-2',
    resolvedAt: '2026-04-06T17:15:00Z',
    resolvedBy: 'u-2',
    outcome: 'false_alarm',
    notes: 'Person in bathroom for 15 minutes. False alarm — was just reading.',
  },
];
