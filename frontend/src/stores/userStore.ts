import { create } from 'zustand';
import type { User } from '../types';

interface UserState {
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
  
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  
  editingUser: null,
  setEditingUser: (user) => set({ editingUser: user }),
}));
