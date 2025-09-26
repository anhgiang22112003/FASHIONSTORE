import React, { useState } from 'react';

const colors = [
    { name: 'Đỏ', hex: '#EF4444', ring: 'ring-red-500' },
    { name: 'Hồng', hex: '#EC4899', ring: 'ring-pink-500' },
    { name: 'Xanh dương', hex: '#3B82F6', ring: 'ring-blue-500' },
    { name: 'Xanh lá', hex: '#22C55E', ring: 'ring-green-500' },
    { name: 'Vàng', hex: '#EAB308', ring: 'ring-yellow-500' },
    { name: 'Tím', hex: '#A855F7', ring: 'ring-purple-500' },
    { name: 'Đen', hex: '#111827', ring: 'ring-gray-900' },
    { name: 'Trắng', hex: '#F9FAFB', ring: 'ring-gray-300' },
];

const ProductVariations = ({ variations, setVariations }) => {
    const [newColor, setNewColor] = useState('');
    const [newSize, setNewSize] = useState('');
    const [newStock, setNewStock] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false); // State mới để quản lý bảng màu

    const handleAddVariation = () => {
        if (newColor && newSize && newStock) {
            const newVariation = {
                color: newColor,
                size: newSize,
                stock: parseInt(newStock)
            };
            setVariations([...variations, newVariation]);
            setNewColor('');
            setNewSize('');
            setNewStock('');
            setIsFormVisible(false);
        } else {
            alert('Vui lòng điền đầy đủ thông tin biến thể.');
        }
    };

    const handleDeleteVariation = (index) => {
        const updatedVariations = variations.filter((_, i) => i !== index);
        setVariations(updatedVariations);
    };

    const handleColorSelect = (colorName) => {
        setNewColor(colorName);
        setIsColorPickerOpen(false); // Đóng bảng màu sau khi chọn
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Biến thể sản phẩm</h3>

            {/* Bảng hiển thị các biến thể đã thêm */}
            {/* ... (phần này giữ nguyên) */}
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
                            {variations.map((v, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.color}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteVariation(index)} className="text-red-600 hover:text-red-900">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form thêm biến thể mới */}
            <div className="space-y-4">
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                    {isFormVisible ? 'Đóng' : 'Thêm biến thể mới'}
                </button>

                {isFormVisible && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl">
                        {/* Thay đổi phần chọn màu */}
                        <div className="space-y-1 relative">
                            <span className="text-sm font-medium text-gray-600">Màu sắc</span>
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

                            {/* Bảng màu hiện ra khi state isColorPickerOpen là true */}
                            {isColorPickerOpen && (
                                <div className="absolute top-full left-0 mt-2 z-10 p-4 bg-white border border-gray-300 rounded-lg shadow-xl grid grid-cols-4 gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => handleColorSelect(color.name)}
                                            className={`w-8 h-8 rounded-full border border-gray-300 transition-all ${
                                                newColor === color.name ? `ring-2 ring-offset-2 ${color.ring}` : ''
                                            }`}
                                            style={{ backgroundColor: color.hex }}
                                            aria-label={`Chọn màu ${color.name}`}
                                        ></button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <label className="space-y-1">
                            {/* ... (Giữ nguyên input kích thước và tồn kho) */}
                             <span className="text-sm font-medium text-gray-600">Kích thước</span>
                            <input
                                type="text"
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                placeholder="VD: M"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </label>
                        <label className="space-y-1">
                            <span className="text-sm font-medium text-gray-600">Tồn kho</span>
                            <input
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </label>
                        <button
                            onClick={handleAddVariation}
                            className="w-full self-end px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                        >
                            Thêm vào danh sách
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductVariations;