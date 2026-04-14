/**
 * ABOUTME: Home API module for creating, retrieving, and managing homes and memberships.
 */

import { apiClient } from './client';
import { BackendHome, BackendHomeDetail } from './types';
import { Home } from '../types';

export const mapBackendHomeToHome = (bh: BackendHome): Home => ({
  id: bh.id,
  name: bh.name,
  address: bh.address || undefined,
  createdBy: bh.created_by,
  createdAt: bh.created_at,
});

export const createHome = async (name: string, address?: string): Promise<Home> => {
  const response = await apiClient.post<BackendHome>('/homes', { name, address });
  return mapBackendHomeToHome(response.data);
};

export const getHome = async (homeId: string): Promise<Home & { inviteCode: string; members: any[] }> => {
  const response = await apiClient.get<BackendHomeDetail>(`/homes/${homeId}`);
  const bh = response.data;
  return {
    ...mapBackendHomeToHome(bh),
    inviteCode: bh.invite_code,
    members: bh.members.map(m => ({
      userId: m.user_id,
      name: m.name,
      role: m.role,
      joinedAt: m.joined_at,
    })),
  };
};

export const patchHome = async (homeId: string, data: Partial<Home>): Promise<Home> => {
  const response = await apiClient.patch<BackendHome>(`/homes/${homeId}`, data);
  return mapBackendHomeToHome(response.data);
};

export const joinHome = async (inviteCode: string): Promise<Home> => {
  const response = await apiClient.post<BackendHome>('/homes/join', { invite_code: inviteCode });
  return mapBackendHomeToHome(response.data);
};

export const regenerateInviteCode = async (homeId: string): Promise<string> => {
  const response = await apiClient.post<{ invite_code: string }>(`/homes/${homeId}/invite`);
  return response.data.invite_code;
};
