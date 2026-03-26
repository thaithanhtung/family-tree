import api from './axios';
import type {
  Person,
  CreatePersonInput,
  UpdatePersonInput,
  PositionUpdate,
} from '../types';

export const personApi = {
  getByFamilyTreeId: async (familyTreeId: number): Promise<Person[]> => {
    const response = await api.get(`/family-trees/${familyTreeId}/persons`);
    return response.data;
  },

  getById: async (id: number): Promise<Person> => {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  },

  create: async (data: CreatePersonInput): Promise<Person> => {
    const response = await api.post('/persons', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePersonInput): Promise<Person> => {
    const response = await api.put(`/persons/${id}`, data);
    return response.data;
  },

  updatePosition: async (id: number, positionX: number, positionY: number): Promise<Person> => {
    const response = await api.patch(`/persons/${id}/position`, { positionX, positionY });
    return response.data;
  },

  updateManyPositions: async (positions: PositionUpdate[]): Promise<Person[]> => {
    const response = await api.patch('/persons/positions/batch', { positions });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/persons/${id}`);
  },
};
