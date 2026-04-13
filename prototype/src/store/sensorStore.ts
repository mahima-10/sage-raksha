import { create } from 'zustand';
import { Sensor } from '../types';
import { MOCK_SENSORS } from '../constants/mockData';

interface SensorState {
  sensors: Sensor[];
  
  addSensor: (sensor: Sensor) => void;
  removeSensor: (id: string) => void;
  renameSensor: (id: string, label: string) => void;
  getSensorById: (id: string) => Sensor | undefined;
  getSensorsByHomeId: (homeId: string) => Sensor[];
}

export const useSensorStore = create<SensorState>()((set, get) => ({
      sensors: MOCK_SENSORS,

      addSensor: (sensor) => set((state) => ({
        sensors: [...state.sensors, sensor]
      })),

      removeSensor: (id) => set((state) => ({
        sensors: state.sensors.filter(s => s.id !== id)
      })),

      renameSensor: (id, label) => set((state) => ({
        sensors: state.sensors.map(s => s.id === id ? { ...s, label } : s)
      })),

      getSensorById: (id) => get().sensors.find(s => s.id === id),
      
      getSensorsByHomeId: (homeId) => get().sensors.filter(s => s.homeId === homeId),
    }));
