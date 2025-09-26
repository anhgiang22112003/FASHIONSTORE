import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Modal chung
const CommonModal = ({ title, isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl p-6 mx-auto shadow-xl ${className}`}>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const EditPromotionModal = ({ title, isOpen, onClose, onSave, promotion = null }) => {
  const [formData, setFormData] = useState({
    name: promotion?.name || '',
    code: promotion?.code || '',
    description: promotion?.description || '',
    type: promotion?.type || 'percent',
    discountValue: promotion?.discountValue || '',
    minOrderValue: promotion?.minOrderValue || '',
    maxDiscount: promotion?.maxDiscount || '',
    startDate: promotion?.startDate || '',
    endDate: promotion?.endDate || '',
    usageLimit: promotion?.maxUsage || '',
    isFreeShipping: promotion?.isFreeShipping || false,
    category: promotion?.category || 'Tất cả danh mục',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleGenerateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, code: newCode }));
  };

  return (
    <CommonModal title={title} isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl">
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái */}
        <div className="space-y-4">
          {/* Tên khuyến mại */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên khuyến mại</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
              placeholder="Nhập tên khuyến mại"
            />
          </div>
          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full h-24 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
              placeholder="Mô tả chi tiết về khuyến mại"
            ></textarea>
          </div>
          {/* Loại khuyến mại */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại khuyến mại</label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="percent"
                  checked={formData.type === 'percent'}
                  onChange={handleInputChange}
                  className="form-radio text-[#ff69b4] focus:ring-[#ff69b4]"
                />
                <span className="text-gray-700 text-sm">Giảm theo %</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="amount"
                  checked={formData.type === 'amount'}
                  onChange={handleInputChange}
                  className="form-radio text-[#ff69b4] focus:ring-[#ff69b4]"
                />
                <span className="text-gray-700 text-sm">Giảm theo số tiền</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="freeship"
                  checked={formData.type === 'freeship'}
                  onChange={handleInputChange}
                  className="form-radio text-[#ff69b4] focus:ring-[#ff69b4]"
                />
                <span className="text-gray-700 text-sm">Miễn phí vận chuyển</span>
              </label>
            </div>
          </div>
          {/* Nhập giá trị giảm */}
          {formData.type === 'percent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
                placeholder="VD: 20"
              />
            </div>
          )}
          {formData.type === 'amount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Số tiền giảm</label>
              <input
                type="text"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
                placeholder="VD: 50.000"
              />
            </div>
          )}
          {/* Đơn hàng tối thiểu + giảm tối đa */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Đơn hàng tối thiểu</label>
              <input
                type="text"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
                placeholder="VD: 200.000"
              />
            </div>
            {formData.type === 'percent' && (
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Giảm tối đa</label>
                <input
                  type="text"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
                  placeholder="VD: 100.000"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          {/* Mã khuyến mại */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã khuyến mại</label>
            <div className="flex mt-1">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
                placeholder="VD: SALE20"
              />
              <button
                onClick={handleGenerateCode}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-r-lg hover:bg-gray-600 transition-colors"
              >
                Tạo mã
              </button>
            </div>
          </div>
          {/* Ngày bắt đầu - kết thúc */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
              />
            </div>
          </div>
          {/* Giới hạn sử dụng */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Giới hạn sử dụng</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
              placeholder="VD: 100"
            />
          </div>
          {/* Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Áp dụng cho danh mục</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
            >
              <option>Tất cả danh mục</option>
              <option>Váy</option>
              <option>Áo</option>
              <option>Quần</option>
            </select>
          </div>
          {/* Preview */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-800">Xem trước</h4>
            <p className="text-sm mt-1 text-gray-600">
              Mã: <span className="font-semibold text-[#ff69b4]">{formData.code || '...'}</span>
              <br />
              {formData.type === 'freeship' ? (
                <>Miễn phí vận chuyển</>
              ) : (
                <>
                  Giảm:{' '}
                  <span className="font-semibold text-[#ff69b4]">
                    {formData.discountValue || '0'} {formData.type === 'percent' ? '%' : 'đ'}
                  </span>
                  <br />
                  {formData.type === 'percent' && (
                    <>
                      Giảm tối đa:{' '}
                      <span className="font-semibold text-[#ff69b4]">
                        {formData.maxDiscount || '0đ'}
                      </span>
                      <br />
                    </>
                  )}
                </>
              )}
              Đơn tối thiểu:{' '}
              <span className="font-semibold text-[#ff69b4]">
                {formData.minOrderValue || '0đ'}
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-[#ff69b4] rounded-lg hover:bg-[#ff4f9f] transition-colors"
        >
          {promotion ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </CommonModal>
  );
};

export default EditPromotionModal;
