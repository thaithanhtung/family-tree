import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyTreeApi } from '../services/familyTreeApi';
import type {
  CreateFamilyTreeInput,
  UpdateFamilyTreeInput,
  AddMemberInput,
} from '../types';

export const useFamilyTrees = () => {
  return useQuery({
    queryKey: ['familyTrees'],
    queryFn: familyTreeApi.getMyTrees,
  });
};

export const useFamilyTree = (id: number) => {
  return useQuery({
    queryKey: ['familyTree', id],
    queryFn: () => familyTreeApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateFamilyTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFamilyTreeInput) => familyTreeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyTrees'] });
    },
  });
};

export const useUpdateFamilyTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFamilyTreeInput }) =>
      familyTreeApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['familyTrees'] });
      queryClient.invalidateQueries({ queryKey: ['familyTree', id] });
    },
  });
};

export const useDeleteFamilyTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => familyTreeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyTrees'] });
    },
  });
};

export const useAddTreeMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ treeId, data }: { treeId: number; data: AddMemberInput }) =>
      familyTreeApi.addMember(treeId, data),
    onSuccess: (_, { treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['familyTree', treeId] });
    },
  });
};

export const useRemoveTreeMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ treeId, userId }: { treeId: number; userId: number }) =>
      familyTreeApi.removeMember(treeId, userId),
    onSuccess: (_, { treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['familyTree', treeId] });
    },
  });
};
