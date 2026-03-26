import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../services/todoApi';
import type { CreateTodoInput, UpdateTodoInput } from '../types';

export const todoKeys = {
  all: ['todos'] as const,
  my: ['todos', 'my'] as const,
};

export function useMyTodos() {
  return useQuery({
    queryKey: todoKeys.my,
    queryFn: todoApi.getMyTodos,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoInput) => todoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.my });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoInput }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.my });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.my });
    },
  });
}
