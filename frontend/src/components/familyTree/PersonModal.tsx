import { useState, useEffect } from 'react';
import type { Person, CreatePersonInput, UpdatePersonInput, Gender } from '../../types';
import { uploadApi } from '../../services/uploadApi';

interface DefaultParents {
  father?: Person | null;
  mother?: Person | null;
}

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonInput | UpdatePersonInput) => void;
  person?: Person | null;
  familyTreeId: number;
  persons: Person[];
  defaultParents?: DefaultParents | null;
  isLoading?: boolean;
  onAvatarUploaded?: () => void;
}

export function PersonModal({
  isOpen,
  onClose,
  onSubmit,
  person,
  familyTreeId,
  persons,
  defaultParents,
  isLoading,
  onAvatarUploaded,
}: PersonModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE' as Gender,
    phoneNumber: '',
    birthDate: '',
    birthPlace: '',
    bio: '',
    fatherId: '',
    motherId: '',
    isDeceased: false,
    deathDate: '',
    deathPlace: '',
    burialPlace: '',
    branchColor: '#3b82f6',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        gender: person.gender,
        phoneNumber: person.phoneNumber || '',
        birthDate: person.birthDate ? person.birthDate.split('T')[0] : '',
        birthPlace: person.birthPlace || '',
        bio: person.bio || '',
        fatherId: person.fatherId?.toString() || '',
        motherId: person.motherId?.toString() || '',
        isDeceased: person.isDeceased,
        deathDate: person.deathDate ? person.deathDate.split('T')[0] : '',
        deathPlace: person.deathPlace || '',
        burialPlace: person.burialPlace || '',
        branchColor: person.branchColor || '#3b82f6',
      });
      setAvatarPreview(person.avatar || null);
    } else {
      setFormData({
        name: '',
        gender: 'MALE',
        phoneNumber: '',
        birthDate: '',
        birthPlace: '',
        bio: '',
        fatherId: defaultParents?.father?.id.toString() || '',
        motherId: defaultParents?.mother?.id.toString() || '',
        isDeceased: false,
        deathDate: '',
        deathPlace: '',
        burialPlace: '',
        branchColor: defaultParents?.father?.branchColor || defaultParents?.mother?.branchColor || '#3b82f6',
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
  }, [person, defaultParents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !person) return;
    
    setIsUploading(true);
    try {
      await uploadApi.uploadPersonAvatar(person.id, avatarFile);
      setAvatarFile(null);
      onAvatarUploaded?.();
      alert('Upload ảnh thành công!');
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Upload ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!person || !person.avatar) return;
    
    if (!window.confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return;
    
    setIsUploading(true);
    try {
      await uploadApi.deletePersonAvatar(person.id);
      setAvatarPreview(null);
      onAvatarUploaded?.();
      alert('Xóa ảnh thành công!');
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      alert('Xóa ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreatePersonInput | UpdatePersonInput = {
      name: formData.name,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber || undefined,
      birthDate: formData.birthDate || undefined,
      birthPlace: formData.birthPlace || undefined,
      bio: formData.bio || undefined,
      fatherId: formData.fatherId ? parseInt(formData.fatherId) : undefined,
      motherId: formData.motherId ? parseInt(formData.motherId) : undefined,
      isDeceased: formData.isDeceased,
      deathDate: formData.isDeceased && formData.deathDate ? formData.deathDate : undefined,
      deathPlace: formData.isDeceased && formData.deathPlace ? formData.deathPlace : undefined,
      burialPlace: formData.isDeceased && formData.burialPlace ? formData.burialPlace : undefined,
      branchColor: formData.branchColor,
    };

    if (!person) {
      (data as CreatePersonInput).familyTreeId = familyTreeId;
    }

    onSubmit(data);
  };

  const males = persons.filter((p) => p.gender === 'MALE' && p.id !== person?.id);
  const females = persons.filter((p) => p.gender === 'FEMALE' && p.id !== person?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {person ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
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
          {/* Avatar Section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="mt-3 flex gap-2">
              <label className="cursor-pointer px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              
              {person && avatarFile && (
                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  disabled={isUploading}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isUploading ? 'Đang tải...' : 'Upload'}
                </button>
              )}
              
              {person && person.avatar && !avatarFile && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isUploading}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Xóa ảnh
                </button>
              )}
            </div>
            
            {!person && avatarFile && (
              <p className="mt-2 text-xs text-amber-600">
                Lưu thành viên trước, sau đó mở lại để upload ảnh
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nơi sinh
              </label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Màu nhánh
              </label>
              <input
                type="color"
                value={formData.branchColor}
                onChange={(e) => setFormData({ ...formData, branchColor: e.target.value })}
                className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cha
              </label>
              <select
                value={formData.fatherId}
                onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn cha --</option>
                {males.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mẹ
              </label>
              <select
                value={formData.motherId}
                onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn mẹ --</option>
                {females.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiểu sử
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDeceased}
                  onChange={(e) => setFormData({ ...formData, isDeceased: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Đã mất</span>
              </label>
            </div>

            {formData.isDeceased && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày mất
                  </label>
                  <input
                    type="date"
                    value={formData.deathDate}
                    onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nơi mất
                  </label>
                  <input
                    type="text"
                    value={formData.deathPlace}
                    onChange={(e) => setFormData({ ...formData, deathPlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nơi an táng
                  </label>
                  <input
                    type="text"
                    value={formData.burialPlace}
                    onChange={(e) => setFormData({ ...formData, burialPlace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : person ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
