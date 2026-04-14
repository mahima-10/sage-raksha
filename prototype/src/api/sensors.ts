/**
 * ABOUTME: Sensor API module for pairing, listing, and managing mmWave radar sensors.
 */

import { apiClient } from './client';
import { BackendSensor, BackendSensorListResponse } from './types';
import { Sensor } from '../types';

export const mapBackendSensorToSensor = (bs: BackendSensor): Sensor => ({
  id: bs.id,
  hardwareId: bs.hardware_id,
  label: bs.label,
  homeId: bs.home_id,
  status: bs.status,
  lastHeartbeat: bs.last_heartbeat || '',
  createdAt: bs.created_at,
});

export const listSensors = async (homeId: string): Promise<Sensor[]> => {
  const response = await apiClient.get<BackendSensorListResponse>(`/homes/${homeId}/sensors`);
  return response.data.sensors.map(mapBackendSensorToSensor);
};

export const getSensor = async (homeId: string, sensorId: string): Promise<Sensor & { activeAlertCount: number; recentAlerts: any[] }> => {
  const response = await apiClient.get<BackendSensor>(`/homes/${homeId}/sensors/${sensorId}`);
  const bs = response.data;
  return {
    ...mapBackendSensorToSensor(bs),
    activeAlertCount: bs.active_alert_count || 0,
    recentAlerts: (bs.recent_alerts || []).map(ra => ({
      id: ra.id,
      alertType: ra.alert_type,
      state: ra.state,
      triggeredAt: ra.triggered_at,
      outcome: ra.outcome,
    })),
  };
};

export const createSensor = async (homeId: string, hardwareId: string, label: string): Promise<Sensor & { apiKey: string }> => {
  const response = await apiClient.post<BackendSensor>(`/homes/${homeId}/sensors`, {
    hardware_id: hardwareId,
    label,
  });
  return {
    ...mapBackendSensorToSensor(response.data),
    apiKey: response.data.api_key || '',
  };
};

export const updateSensor = async (homeId: string, sensorId: string, label: string): Promise<Sensor> => {
  const response = await apiClient.patch<BackendSensor>(`/homes/${homeId}/sensors/${sensorId}`, {
    label,
  });
  return mapBackendSensorToSensor(response.data);
};

export const deleteSensor = async (homeId: string, sensorId: string): Promise<void> => {
  await apiClient.delete(`/homes/${homeId}/sensors/${sensorId}`);
};
