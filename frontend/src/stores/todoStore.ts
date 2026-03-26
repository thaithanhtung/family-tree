import { create } from 'zustand';

type FilterType = 'all' | 'active' | 'completed';

interface TodoState {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}));
