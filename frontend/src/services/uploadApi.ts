import api from './axios';
import type { Person } from '../types';

export const uploadApi = {
  uploadPersonAvatar: async (personId: number, file: File): Promise<Person> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post(`/upload/persons/${personId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.person;
  },

  deletePersonAvatar: async (personId: number): Promise<Person> => {
    const response = await api.delete(`/upload/persons/${personId}/avatar`);
    return response.data.person;
  },
};
