/**
 * ABOUTME: Emergency Contact API module for managing a home's emergency contact list.
 */

import { apiClient } from './client';
import { BackendEmergencyContact, BackendContactListResponse } from './types';
import { EmergencyContact } from '../types';

export const mapBackendContactToContact = (bc: BackendEmergencyContact): EmergencyContact => ({
  id: bc.id,
  homeId: bc.home_id,
  name: bc.name,
  phone: bc.phone,
  relationship: bc.relationship,
  createdAt: bc.created_at,
});

export const listContacts = async (homeId: string): Promise<EmergencyContact[]> => {
  const response = await apiClient.get<BackendContactListResponse>(`/homes/${homeId}/contacts`);
  return response.data.contacts.map(mapBackendContactToContact);
};

export const createContact = async (
  homeId: string, 
  data: Omit<EmergencyContact, 'id' | 'homeId' | 'createdAt'>
): Promise<EmergencyContact> => {
  const response = await apiClient.post<BackendEmergencyContact>(`/homes/${homeId}/contacts`, data);
  return mapBackendContactToContact(response.data);
};

export const patchContact = async (
  homeId: string, 
  contactId: string, 
  data: Partial<Omit<EmergencyContact, 'id' | 'homeId' | 'createdAt'>>
): Promise<EmergencyContact> => {
  const response = await apiClient.patch<BackendEmergencyContact>(`/homes/${homeId}/contacts/${contactId}`, data);
  return mapBackendContactToContact(response.data);
};

export const deleteContact = async (homeId: string, contactId: string): Promise<void> => {
  await apiClient.delete(`/homes/${homeId}/contacts/${contactId}`);
};
