import { useState, useEffect } from 'react';
import type { Person, Marriage, CreateMarriageInput, MarriageStatus } from '../../types';

interface MarriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMarriageInput) => void;
  marriage?: Marriage | null;
  familyTreeId: number;
  persons: Person[];
  defaultPerson?: Person | null;
  isLoading?: boolean;
}

export function MarriageModal({
  isOpen,
  onClose,
  onSubmit,
  marriage,
  familyTreeId,
  persons,
  defaultPerson,
  isLoading,
}: MarriageModalProps) {
  const [formData, setFormData] = useState({
    spouse1Id: '',
    spouse2Id: '',
    marriageDate: '',
    marriagePlace: '',
    status: 'MARRIED' as MarriageStatus,
  });

  useEffect(() => {
    if (marriage) {
      setFormData({
        spouse1Id: marriage.spouse1Id.toString(),
        spouse2Id: marriage.spouse2Id.toString(),
        marriageDate: marriage.marriageDate ? marriage.marriageDate.split('T')[0] : '',
        marriagePlace: marriage.marriagePlace || '',
        status: marriage.status,
      });
    } else if (defaultPerson) {
      setFormData({
        spouse1Id: defaultPerson.id.toString(),
        spouse2Id: '',
        marriageDate: '',
        marriagePlace: '',
        status: 'MARRIED',
      });
    } else {
      setFormData({
        spouse1Id: '',
        spouse2Id: '',
        marriageDate: '',
        marriagePlace: '',
        status: 'MARRIED',
      });
    }
  }, [marriage, defaultPerson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateMarriageInput = {
      familyTreeId,
      spouse1Id: parseInt(formData.spouse1Id),
      spouse2Id: parseInt(formData.spouse2Id),
      marriageDate: formData.marriageDate || undefined,
      marriagePlace: formData.marriagePlace || undefined,
      status: formData.status,
    };

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {marriage ? 'Chỉnh sửa hôn nhân' : 'Thêm quan hệ vợ chồng'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người thứ nhất *
              </label>
              <select
                value={formData.spouse1Id}
                onChange={(e) => setFormData({ ...formData, spouse1Id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn --</option>
                {persons
                  .filter((p) => p.id.toString() !== formData.spouse2Id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender === 'MALE' ? 'Nam' : 'Nữ'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người thứ hai *
              </label>
              <select
                value={formData.spouse2Id}
                onChange={(e) => setFormData({ ...formData, spouse2Id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn --</option>
                {persons
                  .filter((p) => p.id.toString() !== formData.spouse1Id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender === 'MALE' ? 'Nam' : 'Nữ'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày cưới
              </label>
              <input
                type="date"
                value={formData.marriageDate}
                onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nơi cưới
              </label>
              <input
                type="text"
                value={formData.marriagePlace}
                onChange={(e) => setFormData({ ...formData, marriagePlace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MarriageStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MARRIED">Đang kết hôn</option>
                <option value="DIVORCED">Đã ly hôn</option>
                <option value="WIDOWED">Góa</option>
                <option value="SEPARATED">Ly thân</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.spouse1Id || !formData.spouse2Id}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : marriage ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
