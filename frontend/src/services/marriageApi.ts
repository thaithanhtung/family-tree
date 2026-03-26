import api from './axios';
import type {
  Marriage,
  CreateMarriageInput,
  UpdateMarriageInput,
  MarriageStatus,
} from '../types';

export const marriageApi = {
  getByFamilyTreeId: async (familyTreeId: number): Promise<Marriage[]> => {
    const response = await api.get(`/marriages/family-tree/${familyTreeId}`);
    return response.data;
  },

  getByPersonId: async (personId: number): Promise<Marriage[]> => {
    const response = await api.get(`/marriages/person/${personId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Marriage> => {
    const response = await api.get(`/marriages/${id}`);
    return response.data;
  },

  create: async (data: CreateMarriageInput): Promise<Marriage> => {
    const response = await api.post('/marriages', data);
    return response.data;
  },

  update: async (id: number, data: UpdateMarriageInput): Promise<Marriage> => {
    const response = await api.put(`/marriages/${id}`, data);
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: MarriageStatus,
    divorceDate?: string,
    divorceReason?: string
  ): Promise<Marriage> => {
    const response = await api.patch(`/marriages/${id}/status`, {
      status,
      divorceDate,
      divorceReason,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/marriages/${id}`);
  },
};
