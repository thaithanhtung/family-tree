import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useFamilyTrees,
  useCreateFamilyTree,
  useDeleteFamilyTree,
} from "../hooks/useFamilyTree";
import { useAuth } from "../contexts/AuthContext";
import { seedApi } from "../services/seedApi";

export function FamilyTreeListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: trees, isLoading, error, refetch } = useFamilyTrees();
  const createTree = useCreateFamilyTree();
  const deleteTree = useDeleteFamilyTree();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const [newTreeDescription, setNewTreeDescription] = useState("");
  const [isCreatingSample, setIsCreatingSample] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreeName.trim()) return;

    try {
      await createTree.mutateAsync({
        name: newTreeName,
        description: newTreeDescription || undefined,
      });
      setNewTreeName("");
      setNewTreeDescription("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create tree:", err);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa cây gia phả "${name}"?`)) {
      try {
        await deleteTree.mutateAsync(id);
      } catch (err) {
        console.error("Failed to delete tree:", err);
      }
    }
  };

  const handleCreateSample = async (count: number = 50) => {
    const confirmMsg =
      count >= 1000
        ? `Tạo cây gia phả mẫu với ${count.toLocaleString()} thành viên?\n\n⚠️ Quá trình này có thể mất vài phút.`
        : `Tạo cây gia phả mẫu với ${count.toLocaleString()} thành viên?`;

    if (!window.confirm(confirmMsg)) return;

    setIsCreatingSample(true);
    try {
      const result = await seedApi.createSampleFamilyTree(count);
      alert(
        `Đã tạo "${
          result.familyTree.name
        }" với ${result.memberCount.toLocaleString()} thành viên trong ${
          result.elapsedSeconds
        }s!`
      );
      refetch();
      navigate(`/family-trees/${result.familyTree.id}`);
    } catch (err) {
      console.error("Failed to create sample:", err);
      alert("Tạo dữ liệu mẫu thất bại!");
    } finally {
      setIsCreatingSample(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Lỗi: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cây Gia Phả</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Xin chào, {user?.name || user?.email}
            </span>
            <Link to="/todos" className="text-blue-600 hover:text-blue-800">
              Todos
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách cây gia phả
          </h2>
          <div className="flex gap-2 flex-wrap">
            <div className="relative group">
              <button
                disabled={isCreatingSample}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isCreatingSample ? "Đang tạo..." : "+ Tạo dữ liệu mẫu ▼"}
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleCreateSample(50)}
                  disabled={isCreatingSample}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg"
                >
                  50 người
                </button>
                <button
                  onClick={() => handleCreateSample(100)}
                  disabled={isCreatingSample}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  100 người
                </button>
                <button
                  onClick={() => handleCreateSample(500)}
                  disabled={isCreatingSample}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  500 người
                </button>
                <button
                  onClick={() => handleCreateSample(1000)}
                  disabled={isCreatingSample}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  1,000 người
                </button>
                <button
                  onClick={() => handleCreateSample(5000)}
                  disabled={isCreatingSample}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  5,000 người
                </button>
                <button
                  onClick={() => handleCreateSample(10000)}
                  disabled={isCreatingSample}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg text-orange-600 font-medium"
                >
                  10,000 người ⚡
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Tạo cây mới
            </button>
          </div>
        </div>
        {trees && trees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-6">Bạn chưa có cây gia phả nào</p>
            <div className="flex flex-col gap-3 items-center">
              <p className="text-sm text-gray-400">
                Chọn số lượng thành viên để test:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[50, 100, 500, 1000, 5000, 10000].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleCreateSample(count)}
                    disabled={isCreatingSample}
                    className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${
                      count >= 5000
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {count.toLocaleString()} người
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Hoặc tạo cây gia phả trống
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees?.map((tree) => (
              <div
                key={tree.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tree.name}
                  </h3>
                  {tree.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {tree.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>{tree._count?.persons || 0} thành viên</span>
                    <span className="mx-2">•</span>
                    <span>
                      {tree.ownerId === user?.id ? "Chủ sở hữu" : "Thành viên"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/family-trees/${tree.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                    >
                      Xem chi tiết
                    </Link>
                    {tree.ownerId === user?.id && (
                      <button
                        onClick={() => handleDelete(tree.id, tree.name)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tạo cây gia phả mới
              </h3>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên cây gia phả *
                  </label>
                  <input
                    type="text"
                    value={newTreeName}
                    onChange={(e) => setNewTreeName(e.target.value)}
                    placeholder="VD: Gia phả họ Nguyễn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newTreeDescription}
                    onChange={(e) => setNewTreeDescription(e.target.value)}
                    placeholder="Mô tả về cây gia phả..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createTree.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {createTree.isPending ? "Đang tạo..." : "Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
