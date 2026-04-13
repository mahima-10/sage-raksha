import { create } from 'zustand';
import { EmergencyContact } from '../types';
import { MOCK_CONTACTS } from '../constants/mockData';

interface ContactState {
  contacts: EmergencyContact[];
  
  addContact: (contact: EmergencyContact) => void;
  updateContact: (id: string, data: Partial<EmergencyContact>) => void;
  removeContact: (id: string) => void;
  getContactsByHomeId: (homeId: string) => EmergencyContact[];
}

export const useContactStore = create<ContactState>()((set, get) => ({
      contacts: MOCK_CONTACTS,

      addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, contact]
      })),

      updateContact: (id, data) => set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, ...data } : c)
      })),

      removeContact: (id) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== id)
      })),

      getContactsByHomeId: (homeId) => get().contacts.filter(c => c.homeId === homeId),
    }));
