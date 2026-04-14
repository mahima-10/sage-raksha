/**
 * ABOUTME: Auth API module for requesting OTP, verifying OTP, and token management.
 * ABOUTME: Handles mapping between backend user models and frontend user interfaces.
 */

import { apiClient, saveTokens, clearTokens } from './client';
import { 
  BackendVerifyOTPResponse, 
  BackendRefreshTokenResponse, 
  BackendUser 
} from './types';
import { User, AppMode } from '../types';

/**
 * Maps a backend user object (snake_case) to the frontend User interface (camelCase).
 */
export const mapBackendUserToUser = (bu: BackendUser): User => ({
  id: bu.id,
  phone: bu.phone,
  name: bu.name || undefined,
  // Backend doesn't have 'type' yet, default to caretaker as per Phase 1 scope
  type: 'caretaker', 
  mode: (bu.mode as AppMode) || 'independent',
  linkedHomeIds: bu.home_ids || [],
  createdAt: bu.created_at,
  updatedAt: bu.updated_at,
});

export const requestOtp = async (phone: string) => {
  const response = await apiClient.post('/auth/request-otp', { phone });
  return response.data;
};

export const verifyOtp = async (phone: string, otp: string): Promise<{ user: User; access_token: string; refresh_token: string }> => {
  const response = await apiClient.post<BackendVerifyOTPResponse>('/auth/verify-otp', {
    phone,
    otp,
  });
  
  const { user, access_token, refresh_token } = response.data;
  const mappedUser = mapBackendUserToUser(user);
  
  await saveTokens(access_token, refresh_token);
  
  return {
    user: mappedUser,
    access_token,
    refresh_token,
  };
};

export const refreshToken = async (token: string) => {
  const response = await apiClient.post<BackendRefreshTokenResponse>('/auth/refresh-token', {
    refresh_token: token,
  });
  return response.data;
};

export const logout = async (token: string) => {
  try {
    await apiClient.post('/auth/logout', { refresh_token: token });
  } finally {
    await clearTokens();
  }
};
