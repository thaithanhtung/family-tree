import api from './axios';
import type { FamilyTree } from '../types';

interface SeedResponse {
  message: string;
  familyTree: FamilyTree;
  memberCount: number;
  marriageCount?: number;
  elapsedSeconds?: number;
}

export const seedApi = {
  createSampleFamilyTree: async (memberCount: number = 50): Promise<SeedResponse> => {
    const response = await api.post(`/seed/family-tree?count=${memberCount}`);
    return response.data;
  },
};
