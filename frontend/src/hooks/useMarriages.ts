import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marriageApi } from '../services/marriageApi';
import type {
  CreateMarriageInput,
  UpdateMarriageInput,
  MarriageStatus,
} from '../types';

export const useMarriagesByTree = (familyTreeId: number) => {
  return useQuery({
    queryKey: ['marriages', familyTreeId],
    queryFn: () => marriageApi.getByFamilyTreeId(familyTreeId),
    enabled: !!familyTreeId,
  });
};

export const useMarriagesByPerson = (personId: number) => {
  return useQuery({
    queryKey: ['marriages', 'person', personId],
    queryFn: () => marriageApi.getByPersonId(personId),
    enabled: !!personId,
  });
};

export const useCreateMarriage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMarriageInput) => marriageApi.create(data),
    onSuccess: (marriage) => {
      queryClient.invalidateQueries({ queryKey: ['marriages', marriage.familyTreeId] });
      queryClient.invalidateQueries({ queryKey: ['persons', marriage.familyTreeId] });
    },
  });
};

export const useUpdateMarriage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, familyTreeId: _familyTreeId }: { id: number; data: UpdateMarriageInput; familyTreeId: number }) =>
      marriageApi.update(id, data),
    onSuccess: (_, { familyTreeId: treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['marriages', treeId] });
    },
  });
};

export const useUpdateMarriageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      divorceDate,
      divorceReason,
      familyTreeId: _familyTreeId,
    }: {
      id: number;
      status: MarriageStatus;
      divorceDate?: string;
      divorceReason?: string;
      familyTreeId: number;
    }) => marriageApi.updateStatus(id, status, divorceDate, divorceReason),
    onSuccess: (_, { familyTreeId: treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['marriages', treeId] });
    },
  });
};

export const useDeleteMarriage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, familyTreeId: _familyTreeId }: { id: number; familyTreeId: number }) =>
      marriageApi.delete(id),
    onSuccess: (_, { familyTreeId: treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['marriages', treeId] });
      queryClient.invalidateQueries({ queryKey: ['persons', treeId] });
    },
  });
};
