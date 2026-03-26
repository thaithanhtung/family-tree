import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personApi } from '../services/personApi';
import type {
  CreatePersonInput,
  UpdatePersonInput,
  PositionUpdate,
} from '../types';

export const usePersonsByTree = (familyTreeId: number) => {
  return useQuery({
    queryKey: ['persons', familyTreeId],
    queryFn: () => personApi.getByFamilyTreeId(familyTreeId),
    enabled: !!familyTreeId,
  });
};

export const usePerson = (id: number) => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => personApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonInput) => personApi.create(data),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ['persons', person.familyTreeId] });
      queryClient.invalidateQueries({ queryKey: ['familyTree', person.familyTreeId] });
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePersonInput }) =>
      personApi.update(id, data),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ['persons', person.familyTreeId] });
      queryClient.invalidateQueries({ queryKey: ['person', person.id] });
    },
  });
};

export const useUpdatePersonPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, positionX, positionY }: { id: number; positionX: number; positionY: number }) =>
      personApi.updatePosition(id, positionX, positionY),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ['persons', person.familyTreeId] });
    },
  });
};

export const useUpdateManyPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ positions, familyTreeId: _familyTreeId }: { positions: PositionUpdate[]; familyTreeId: number }) =>
      personApi.updateManyPositions(positions),
    onSuccess: (_, { familyTreeId: treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['persons', treeId] });
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, familyTreeId: _familyTreeId }: { id: number; familyTreeId: number }) =>
      personApi.delete(id),
    onSuccess: (_, { familyTreeId: treeId }) => {
      queryClient.invalidateQueries({ queryKey: ['persons', treeId] });
      queryClient.invalidateQueries({ queryKey: ['familyTree', treeId] });
    },
  });
};
