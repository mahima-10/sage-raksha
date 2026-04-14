import { create } from 'zustand';
import { Alert, AlertOutcome, AlertType } from '../types';
import { MOCK_ALERTS } from '../constants/mockData';

interface AlertState {
  alerts: Alert[];

  triggerAlert: (sensorId: string, homeId: string, alertType?: AlertType) => string;
  triggerStillnessAlert: (sensorId: string, homeId: string) => string;
  escalateAlert: (id: string) => void;
  acknowledgeAlert: (id: string, userId: string) => void;
  resolveAlert: (id: string, userId: string, outcome: AlertOutcome, notes?: string) => void;
  
  getActiveAlerts: () => Alert[];
  getEscalatedAlerts: () => Alert[];
  getAcknowledgedAlerts: () => Alert[];
  getAlertsBySensorId: (sensorId: string) => Alert[];
  getAlertsByHomeId: (homeId: string) => Alert[];
}

export const useAlertStore = create<AlertState>()((set, get) => ({
      alerts: MOCK_ALERTS,

      triggerAlert: (sensorId, homeId, alertType = 'fall') => {
        const id = `a-${Date.now()}`;
        const newAlert: Alert = {
          id,
          sensorId,
          homeId,
          alertType,
          state: 'active',
          triggeredAt: new Date().toISOString(),
        };
        set((state) => ({ alerts: [newAlert, ...state.alerts] }));
        return id;
      },

      triggerStillnessAlert: (sensorId, homeId) => {
        return get().triggerAlert(sensorId, homeId, 'stillness');
      },

      escalateAlert: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, state: 'escalated' } : a)
      })),

      acknowledgeAlert: (id, userId) => set((state) => ({
        alerts: state.alerts.map(a => 
          a.id === id 
            ? { ...a, state: 'acknowledged', acknowledgedAt: new Date().toISOString(), acknowledgedBy: userId } 
            : a
        )
      })),

      resolveAlert: (id, userId, outcome, notes) => set((state) => ({
        alerts: state.alerts.map(a => 
          a.id === id 
            ? { 
                ...a, 
                state: 'resolved', 
                resolvedAt: new Date().toISOString(), 
                resolvedBy: userId, 
                outcome, 
                notes 
              } 
            : a
        )
      })),

      getActiveAlerts: () => get().alerts.filter(a => a.state === 'active'),
      getEscalatedAlerts: () => get().alerts.filter(a => a.state === 'escalated'),
      getAcknowledgedAlerts: () => get().alerts.filter(a => a.state === 'acknowledged'),
      getAlertsBySensorId: (sensorId) => get().alerts.filter(a => a.sensorId === sensorId),
      getAlertsByHomeId: (homeId) => get().alerts.filter(a => a.homeId === homeId),
    }));
