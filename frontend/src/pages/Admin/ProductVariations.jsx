import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ChevronUpDownIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { AdminInput, AdminButton } from "components/admin/ui"

// Danh sách màu sắc cố định (cho bảng chọn nhanh)
const colors = [
  { name: 'Đỏ', hex: '#EF4444', ring: 'ring-red-500' },
  { name: 'Hồng', hex: '#EC4899', ring: 'ring-pink-500' },
  { name: 'Xanh dương', hex: '#3B82F6', ring: 'ring-blue-500' },
  { name: 'Xanh lá', hex: '#22C55E', ring: 'ring-green-500' },
  { name: 'Vàng', hex: '#EAB308', ring: 'ring-yellow-500' },
  { name: 'Tím', hex: '#A855F7', ring: 'ring-purple-500' },
  { name: 'Đen', hex: '#111827', ring: 'ring-gray-900' },
  { name: 'Trắng', hex: '#F9FAFB', ring: 'ring-gray-300' },
]

// Danh sách kích thước phổ biến (để gợi ý chọn nhanh)
const commonSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Freesize', '35', '36', '37', '38', '39', '40']

// Hàm kiểm tra và lấy mã hex cho màu sắc
const getColorHex = (colorNameOrHex) => {
  const hexPattern = /^#([0-9A-F]{3}){1,2}$/i
  if (hexPattern.test(colorNameOrHex)) return colorNameOrHex
  const colorInfo = colors.find(c => c.name === colorNameOrHex)
  return colorInfo ? colorInfo.hex : 'transparent'
}

const ProductVariations = ({ variations, setVariations, setStock }) => {
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newStock, setNewStock] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)

  // Cập nhật tổng tồn kho mỗi khi variations thay đổi
  useEffect(() => {
    const totalStock = variations.reduce((sum, v) => sum + v.stock, 0)
    setStock(totalStock)
  }, [variations, setStock])

  // Hàm kiểm tra trùng lặp
  const isDuplicate = (color, size, currentIndex = -1) => {
    return variations.some((v, index) =>
      index !== currentIndex &&
      v.color.trim().toLowerCase() === color.trim().toLowerCase() &&
      v.size.trim().toLowerCase() === size.trim().toLowerCase()
    )
  }

  // Hàm xử lý Thêm/Cập nhật biến thể
  const handleSaveVariation = () => {
    const trimmedColor = newColor.trim()
    const trimmedSize = newSize.trim()

    if (!trimmedColor || !trimmedSize || newStock === '') {
      toast.error('Vui lòng điền đầy đủ thông tin biến thể.')
      return
    }

    const stockValue = parseInt(newStock)
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('Tồn kho phải là một số không âm.')
      return
    }

    if (isDuplicate(trimmedColor, trimmedSize, editingIndex)) {
      toast.error('Lỗi: Biến thể với Màu sắc và Kích thước này đã tồn tại.')
      return
    }

    const newVariation = { color: trimmedColor, size: trimmedSize, stock: stockValue }

    let updatedVariations
    if (editingIndex !== null) {
      updatedVariations = variations.map((v, i) => i === editingIndex ? newVariation : v)
      toast.success('Cập nhật biến thể thành công!')
    } else {
      updatedVariations = [...variations, newVariation]
      toast.success('Thêm biến thể thành công!')
    }

    setVariations(updatedVariations)
    handleCloseForm()
  }

  const handleEditVariation = (index) => {
    const variationToEdit = variations[index]
    setNewColor(variationToEdit.color)
    setNewSize(variationToEdit.size)
    setNewStock(String(variationToEdit.stock))
    setEditingIndex(index)
    setIsFormVisible(true)
    setIsColorPickerOpen(false)
    setIsSizePickerOpen(false)
  }

  const handleDeleteVariation = (index) => {
    const updatedVariations = variations.filter((_, i) => i !== index)
    setVariations(updatedVariations)
    if (editingIndex === index) handleCloseForm()
    toast.success('Đã xóa biến thể.')
  }

  const handleColorSelect = (colorName) => {
    setNewColor(colorName)
    setIsColorPickerOpen(false)
  }

  const handleSizeSelect = (size) => {
    setNewSize(size)
    setIsSizePickerOpen(false)
  }

  const handleCloseForm = () => {
    setNewColor('')
    setNewSize('')
    setNewStock('')
    setEditingIndex(null)
    setIsFormVisible(false)
    setIsColorPickerOpen(false)
    setIsSizePickerOpen(false)
  }

  const totalStock = variations.reduce((sum, v) => sum + v.stock, 0)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Biến thể sản phẩm</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {variations.length} biến thể • Tổng tồn kho:{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalStock}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isFormVisible) {
              handleCloseForm()
            } else {
              setIsFormVisible(true)
              setEditingIndex(null)
            }
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors shadow-sm ${
            isFormVisible
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isFormVisible ? (
            editingIndex !== null ? 'Hủy chỉnh sửa' : 'Đóng'
          ) : (
            <>
              <PlusIcon className="w-3.5 h-3.5" />
              Thêm biến thể
            </>
          )}
        </button>
      </div>

      {/* Variation Form */}
      {isFormVisible && (
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            {editingIndex !== null ? '✏️ Chỉnh sửa biến thể' : '✨ Thêm biến thể mới'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">

            {/* Màu sắc */}
            <div className="relative">
              <div className="relative">
                <AdminInput
                  label="Màu sắc"
                  type="text"
                  value={newColor}
                  onChange={(e) => {
                    setNewColor(e.target.value)
                    setIsColorPickerOpen(false)
                  }}
                  placeholder="VD: Xanh navy hoặc #000080"
                />
                <button
                  type="button"
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className="absolute right-2.5 bottom-[12px] flex items-center p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md transition-shadow z-10"
                  title="Mở bảng màu nhanh"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: getColorHex(newColor) || '#e2e8f0' }}
                  />
                </button>
              </div>

              {/* Color Picker Dropdown */}
              {isColorPickerOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-20 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl grid grid-cols-4 gap-2 w-52">
                  <p className="col-span-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Chọn nhanh:</p>
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleColorSelect(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newColor === color.name
                          ? `ring-2 ring-offset-2 ${color.ring} border-white`
                          : 'border-slate-200 dark:border-slate-700 hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Kích thước */}
            <div className="relative">
              <div className="relative">
                <AdminInput
                  label="Kích thước"
                  type="text"
                  value={newSize}
                  onChange={(e) => {
                    setNewSize(e.target.value)
                    setIsSizePickerOpen(e.target.value.length === 0)
                  }}
                  onFocus={() => setIsSizePickerOpen(newSize.length === 0)}
                  onBlur={() => setTimeout(() => setIsSizePickerOpen(false), 200)}
                  placeholder="VD: M, XL, Size 32"
                />
                <button
                  type="button"
                  onClick={() => setIsSizePickerOpen(!isSizePickerOpen)}
                  className="absolute right-2.5 bottom-[12px] p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md transition-shadow z-10"
                  title="Mở gợi ý kích thước"
                >
                  <ChevronUpDownIcon className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>

              {/* Size Picker Dropdown */}
              {isSizePickerOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-20 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl grid grid-cols-4 gap-1.5 w-52">
                  <p className="col-span-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Chọn nhanh:</p>
                  {commonSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeSelect(size)}
                      className={`px-2 py-1 text-xs rounded-lg border font-semibold transition-all ${
                        newSize === size
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tồn kho */}
            <AdminInput
              label="Tồn kho"
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="0"
              min="0"
            />

            {/* Nút lưu */}
            <div>
              <AdminButton
                type="button"
                onClick={handleSaveVariation}
                variant={editingIndex !== null ? 'success' : 'primary'}
                className="w-full h-[46px] text-xs font-bold rounded-xl"
              >
                {editingIndex !== null ? 'Lưu chỉnh sửa' : 'Thêm vào danh sách'}
              </AdminButton>
            </div>
          </div>

          {editingIndex !== null && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-3">
              * Màu sắc và Kích thước có thể không chỉnh sửa được nếu đã tạo nhiều biến thể liên quan.
            </p>
          )}
        </div>
      )}

      {/* Variations Table */}
      {variations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Màu sắc</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kích thước</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {variations.map((v, index) => {
                const hexColor = getColorHex(v.color)
                const isEditing = editingIndex === index
                return (
                  <tr
                    key={index}
                    className={`transition-colors ${isEditing ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}
                  >
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex-shrink-0"
                          style={{ backgroundColor: hexColor }}
                          title={v.color}
                        />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{v.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                        {v.size}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`text-sm font-bold ${v.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditVariation(index)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={editingIndex !== null && editingIndex !== index}
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariation(index)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                          title="Xóa"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Chưa có biến thể nào</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
            Nhấn "Thêm biến thể" để thêm màu sắc và kích thước cho sản phẩm.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductVariations