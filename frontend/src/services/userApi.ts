import api from './axios';
import type { User, CreateUserInput } from '../types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (input: CreateUserInput): Promise<User> => {
    const { data } = await api.post('/users', input);
    return data;
  },

  update: async (id: number, input: Partial<CreateUserInput>): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, input);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
