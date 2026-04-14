/**
 * ABOUTME: Backend response types in snake_case as defined in the FastAPI schemas.
 * ABOUTME: These are used internally by the API layer to map to frontend camelCase types.
 */

export interface BackendUser {
  id: string;
  phone: string;
  name?: string | null;
  mode?: string | null;
  home_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface BackendHome {
  id: string;
  name: string;
  address?: string;
  created_by: string;
  invite_code: string;
  created_at: string;
}

export interface BackendHomeDetail extends BackendHome {
  members: BackendHomeMember[];
}

export interface BackendHomeMember {
  user_id: string;
  name?: string;
  role: 'owner' | 'caretaker';
  joined_at: string;
}

export interface BackendSensor {
  id: string;
  hardware_id: string;
  home_id: string;
  label: string;
  status: 'online' | 'offline';
  last_heartbeat?: string | null;
  created_at: string;
  api_key?: string; // Only returned on creation
  active_alert_count?: number;
  recent_alerts?: BackendAlert[];
}

export interface BackendAlert {
  id: string;
  sensor_id: string;
  home_id: string;
  alert_type: 'fall' | 'stillness';
  state: 'active' | 'escalated' | 'acknowledged' | 'resolved';
  triggered_at: string;
  escalated_at?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  outcome?: 'real_fall' | 'false_alarm' | null;
  notes?: string | null;
}

export interface BackendEmergencyContact {
  id: string;
  home_id: string;
  name: string;
  phone: string;
  relationship: string;
  created_at: string;
}

// Response Wrappers
export interface BackendVerifyOTPResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: BackendUser;
}

export interface BackendRefreshTokenResponse {
  access_token: string;
  token_type: string;
}

export interface BackendSensorListResponse {
  sensors: BackendSensor[];
}

export interface BackendAlertListResponse {
  alerts: BackendAlert[];
}

export interface BackendAlertHistoryResponse {
  items: BackendAlert[];
  next_cursor?: string | null;
  has_more: boolean;
  total_count: number;
}

export interface BackendContactListResponse {
  contacts: BackendEmergencyContact[];
}
