import { create } from 'zustand';
import type { Person, Marriage } from '../types';

interface FamilyTreeState {
  selectedPersonId: number | null;
  editingPerson: Person | null;
  isPersonModalOpen: boolean;
  isMarriageModalOpen: boolean;
  selectedMarriage: Marriage | null;
  
  setSelectedPersonId: (id: number | null) => void;
  setEditingPerson: (person: Person | null) => void;
  openPersonModal: (person?: Person) => void;
  closePersonModal: () => void;
  openMarriageModal: (marriage?: Marriage) => void;
  closeMarriageModal: () => void;
}

export const useFamilyTreeStore = create<FamilyTreeState>((set) => ({
  selectedPersonId: null,
  editingPerson: null,
  isPersonModalOpen: false,
  isMarriageModalOpen: false,
  selectedMarriage: null,

  setSelectedPersonId: (id) => set({ selectedPersonId: id }),
  
  setEditingPerson: (person) => set({ editingPerson: person }),
  
  openPersonModal: (person) => set({ 
    isPersonModalOpen: true, 
    editingPerson: person || null 
  }),
  
  closePersonModal: () => set({ 
    isPersonModalOpen: false, 
    editingPerson: null 
  }),
  
  openMarriageModal: (marriage) => set({ 
    isMarriageModalOpen: true, 
    selectedMarriage: marriage || null 
  }),
  
  closeMarriageModal: () => set({ 
    isMarriageModalOpen: false, 
    selectedMarriage: null 
  }),
}));
