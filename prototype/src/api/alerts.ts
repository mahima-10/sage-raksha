/**
 * ABOUTME: Alert API module for managing active fall/stillness alerts and history.
 */

import { apiClient } from './client';
import { 
  BackendAlert, 
  BackendAlertListResponse, 
  BackendAlertHistoryResponse 
} from './types';
import { Alert, AlertType, AlertState, AlertOutcome } from '../types';

export const mapBackendAlertToAlert = (ba: BackendAlert): Alert => ({
  id: ba.id,
  sensorId: ba.sensor_id,
  homeId: ba.home_id,
  alertType: ba.alert_type as AlertType,
  state: ba.state as AlertState,
  triggeredAt: ba.triggered_at,
  escalatedAt: ba.escalated_at || undefined,
  acknowledgedAt: ba.acknowledged_at || undefined,
  acknowledgedBy: ba.acknowledged_by || undefined,
  resolvedAt: ba.resolved_at || undefined,
  resolvedBy: ba.resolved_by || undefined,
  outcome: (ba.outcome as AlertOutcome) || undefined,
  notes: ba.notes || undefined,
});

export const listActiveAlerts = async (homeId: string): Promise<Alert[]> => {
  const response = await apiClient.get<BackendAlertListResponse>(`/homes/${homeId}/alerts`);
  return response.data.alerts.map(mapBackendAlertToAlert);
};

export const getAlert = async (homeId: string, alertId: string): Promise<Alert> => {
  const response = await apiClient.get<BackendAlert>(`/homes/${homeId}/alerts/${alertId}`);
  return mapBackendAlertToAlert(response.data);
};

export const acknowledgeAlert = async (homeId: string, alertId: string): Promise<Alert> => {
  const response = await apiClient.post<BackendAlert>(`/homes/${homeId}/alerts/${alertId}/acknowledge`, {});
  return mapBackendAlertToAlert(response.data);
};

export const resolveAlert = async (
  homeId: string, 
  alertId: string, 
  outcome: AlertOutcome, 
  notes?: string
): Promise<Alert> => {
  const response = await apiClient.post<BackendAlert>(`/homes/${homeId}/alerts/${alertId}/resolve`, {
    outcome,
    notes,
  });
  return mapBackendAlertToAlert(response.data);
};

export interface AlertFilters {
  alert_type?: AlertType;
  outcome?: AlertOutcome;
}

export const getAlertHistory = async (
  homeId: string, 
  cursor?: string, 
  filters?: AlertFilters
): Promise<{ items: Alert[]; nextCursor?: string; hasMore: boolean; totalCount: number }> => {
  const params = {
    cursor,
    ...filters,
  };
  const response = await apiClient.get<BackendAlertHistoryResponse>(`/homes/${homeId}/alerts/history`, { params });
  const data = response.data;
  
  return {
    items: data.items.map(mapBackendAlertToAlert),
    nextCursor: data.next_cursor || undefined,
    hasMore: data.has_more,
    totalCount: data.total_count,
  };
};
