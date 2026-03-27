import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { useUserStore } from '../stores/userStore';

export function UserList() {
  const { data: users = [], isLoading, isError } = useUsers();
  const deleteUser = useDeleteUser();
  const { selectedUserId, setSelectedUserId } = useUserStore();

  const handleDelete = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser.mutateAsync(userId);
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
        Loading users...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-red-500">
        Failed to load users
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
        No users yet. Create one above!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 p-6 pb-4">Users</h2>
      <ul className="divide-y divide-gray-100">
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedUserId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.name || 'No name'}</p>
                <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleDelete(e, user.id)}
                disabled={deleteUser.isPending}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
