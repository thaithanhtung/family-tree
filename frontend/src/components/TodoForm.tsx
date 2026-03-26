import { useState } from 'react';
import { useCreateTodo } from '../hooks/useTodos';

interface TodoFormProps {
  userId: number;
}

export function TodoForm({ userId }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const createTodo = useCreateTodo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTodo.mutateAsync({ title, userId });
      setTitle('');
    } catch (err) {
      alert('Failed to create todo');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder="Add a new todo..."
        required
      />
      <button
        type="submit"
        disabled={createTodo.isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {createTodo.isPending ? '...' : 'Add'}
      </button>
    </form>
  );
}
