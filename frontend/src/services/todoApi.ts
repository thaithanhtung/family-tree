import api from './axios';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

export const todoApi = {
  async getMyTodos(): Promise<Todo[]> {
    const { data } = await api.get('/todos');
    return data;
  },

  async create(input: CreateTodoInput): Promise<Todo> {
    const { data } = await api.post('/todos', input);
    return data;
  },

  async update(id: number, input: UpdateTodoInput): Promise<Todo> {
    const { data } = await api.put(`/todos/${id}`, input);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/todos/${id}`);
  },
};
