import api from './axios';
import type {
  FamilyTree,
  CreateFamilyTreeInput,
  UpdateFamilyTreeInput,
  AddMemberInput,
  FamilyTreeMember,
} from '../types';

export const familyTreeApi = {
  getMyTrees: async (): Promise<FamilyTree[]> => {
    const response = await api.get('/family-trees');
    return response.data;
  },

  getById: async (id: number): Promise<FamilyTree> => {
    const response = await api.get(`/family-trees/${id}`);
    return response.data;
  },

  create: async (data: CreateFamilyTreeInput): Promise<FamilyTree> => {
    const response = await api.post('/family-trees', data);
    return response.data;
  },

  update: async (id: number, data: UpdateFamilyTreeInput): Promise<FamilyTree> => {
    const response = await api.put(`/family-trees/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/family-trees/${id}`);
  },

  addMember: async (treeId: number, data: AddMemberInput): Promise<FamilyTreeMember> => {
    const response = await api.post(`/family-trees/${treeId}/members`, data);
    return response.data;
  },

  removeMember: async (treeId: number, userId: number): Promise<void> => {
    await api.delete(`/family-trees/${treeId}/members/${userId}`);
  },
};
