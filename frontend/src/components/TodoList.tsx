import type { User, Todo } from '../types';
import { useMyTodos } from '../hooks/useTodos';
import { useTodoStore } from '../stores/todoStore';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  user: User;
}

export function TodoList({ user }: TodoListProps) {
  const { data: todos = [], isLoading, isError } = useMyTodos();
  const { filter, setFilter } = useTodoStore();

  const filteredTodos = todos.filter((todo: Todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t: Todo) => t.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {user.name}'s Todos
        </h2>
        <div className="flex gap-2 text-sm">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {activeCount} active
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {completedCount} done
          </span>
        </div>
      </div>

      <TodoForm userId={user.id} />

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading todos...</div>
      ) : isError ? (
        <div className="text-center py-8 text-red-500">Failed to load todos</div>
      ) : filteredTodos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos`}
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map((todo: Todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </div>
  );
}
