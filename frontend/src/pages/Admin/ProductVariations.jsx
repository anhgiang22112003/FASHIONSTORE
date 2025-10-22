import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

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

const ProductVariations = ({ variations, setVariations, setStock }) => {
    // State cho form thêm/chỉnh sửa
    const [newColor, setNewColor] = useState('')
    const [newSize, setNewSize] = useState('')
    const [newStock, setNewStock] = useState('')
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null) // null: đang thêm mới, index: đang chỉnh sửa

    // Cập nhật tổng tồn kho mỗi khi variations thay đổi
    useEffect(() => {
        const totalStock = variations.reduce((sum, v) => sum + v.stock, 0)
        setStock(totalStock)
    }, [variations, setStock])
    
    // Hàm kiểm tra trùng lặp
    const isDuplicate = (color, size, currentIndex = -1) => {
        return variations.some((v, index) => 
            index !== currentIndex && 
            v.color === color && 
            v.size === size
        )
    }

    // Hàm xử lý Thêm/Cập nhật biến thể
    const handleSaveVariation = () => {
        if (!newColor || !newSize || !newStock) {
            toast.error('Vui lòng điền đầy đủ thông tin biến thể.')
            return
        }

        const stockValue = parseInt(newStock)

        if (isNaN(stockValue) || stockValue < 0) {
            toast.error('Tồn kho phải là một số không âm.')
            return
        }

        if (isDuplicate(newColor, newSize, editingIndex)) {
            toast.error('Lỗi: Biến thể với Màu sắc và Kích thước này đã tồn tại.')
            return
        }

        const newVariation = {
            color: newColor,
            size: newSize,
            stock: stockValue
        }

        let updatedVariations
        if (editingIndex !== null) {
            updatedVariations = variations.map((v, i) => 
                i === editingIndex ? newVariation : v
            )
        } else {
            updatedVariations = [...variations, newVariation]
        }
        
        setVariations(updatedVariations)
        
        // Reset form
        setNewColor('')
        setNewSize('')
        setNewStock('')
        setIsFormVisible(false)
        setEditingIndex(null)
    }

    const handleEditVariation = (index) => {
        const variationToEdit = variations[index]
        setNewColor(variationToEdit.color)
        setNewSize(variationToEdit.size)
        setNewStock(String(variationToEdit.stock)) 
        setEditingIndex(index)
        setIsFormVisible(true) 
        setIsColorPickerOpen(false) 
    }

    const handleDeleteVariation = (index) => {
       
            const updatedVariations = variations.filter((_, i) => i !== index)
            setVariations(updatedVariations)
            if (editingIndex === index) {
                setNewColor('')
                setNewSize('')
                setNewStock('')
                setEditingIndex(null)
                setIsFormVisible(false)
            }
        
    }

    const handleColorSelect = (colorName) => {
        setNewColor(colorName)
        setIsColorPickerOpen(false) 
    }
    const handleCloseForm = () => {
        setNewColor('')
        setNewSize('')
        setNewStock('')
        setEditingIndex(null)
        setIsFormVisible(false)
        setIsColorPickerOpen(false)
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Biến thể sản phẩm</h3>
            
            {/* Bảng danh sách biến thể */}
            {variations.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu sắc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {variations.map((v, index) => {
                                const colorInfo = colors.find(c => c.name === v.color)
                                return (
                                    <tr key={index} className={editingIndex === index ? 'bg-pink-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center space-x-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-400"
                                                style={{ backgroundColor: colorInfo?.hex || 'transparent' }}
                                                title={v.color}
                                            ></div>
                                            <span>{v.color}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.size}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.stock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button 
                                                onClick={() => handleEditVariation(index)} 
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                                disabled={editingIndex !== null && editingIndex !== index}
                                            >
                                                Chỉnh sửa
                                            </button>
                                            <button onClick={() => handleDeleteVariation(index)} className="text-red-600 hover:text-red-900 font-medium">
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            ---

            {/* Form thêm/chỉnh sửa biến thể mới */}
            <div className="space-y-4">
                <button
                    onClick={() => {
                        if (isFormVisible && editingIndex !== null) {
                            // Đang chỉnh sửa và nhấn nút để đóng
                            handleCloseForm()
                        } else if (isFormVisible) {
                             // Đang thêm mới và nhấn nút để đóng
                             handleCloseForm()
                        } else {
                            // Mở form thêm mới
                            setIsFormVisible(true)
                            setEditingIndex(null) // Đảm bảo là chế độ thêm mới
                        }
                    }}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                    {isFormVisible 
                        ? (editingIndex !== null ? 'Hủy chỉnh sửa' : 'Đóng') 
                        : 'Thêm biến thể mới'}
                </button>

                {isFormVisible && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl border border-pink-200">
                        <div className="space-y-1 relative">
                            <span className="text-sm font-medium text-gray-600">Màu sắc {editingIndex !== null && '*'}</span>
                            {/* Nút để mở bảng màu */}
                            <button
                                type="button"
                                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                                className="w-full h-10 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <span className="text-gray-900">{newColor || 'Chọn màu'}</span>
                                <div
                                    className="w-6 h-6 rounded-full border border-gray-400"
                                    style={{ backgroundColor: colors.find(c => c.name === newColor)?.hex || 'transparent' }}
                                ></div>
                            </button>

                            {/* Bảng màu */}
                            {isColorPickerOpen && (
                                <div className="absolute top-full left-0 mt-2 z-10 p-4 bg-white border border-gray-300 rounded-lg shadow-xl grid grid-cols-4 gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => handleColorSelect(color.name)}
                                            className={`w-8 h-8 rounded-full border border-gray-300 transition-all ${newColor === color.name ? `ring-2 ring-offset-2 ${color.ring}` : ''
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                            aria-label={`Chọn màu ${color.name}`}
                                        ></button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label className="space-y-1">
                            <span className="text-sm font-medium text-gray-600">Kích thước {editingIndex !== null && '*'}</span>
                            <input
                                type="text"
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                placeholder="VD: M, L, XL"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </label>
                        <label className="space-y-1">
                            <span className="text-sm font-medium text-gray-600">Tồn kho {editingIndex !== null && '*'}</span>
                            <input
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </label>
                        <button
                            onClick={handleSaveVariation}
                            className={`w-full self-end px-4 py-2 text-white rounded-lg font-semibold transition-colors ${
                                editingIndex !== null ? 'bg-blue-500 hover:bg-blue-600' : 'bg-pink-500 hover:bg-pink-600'
                            }`}
                        >
                            {editingIndex !== null ? 'Lưu chỉnh sửa' : 'Thêm vào danh sách'}
                        </button>
                        {editingIndex !== null && (
                            <p className="md:col-span-4 text-sm text-gray-500 italic">
                                * Màu sắc và Kích thước có thể không chỉnh sửa được nếu đã tạo nhiều biến thể liên quan.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductVariations