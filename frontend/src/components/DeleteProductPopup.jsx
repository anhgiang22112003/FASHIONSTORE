import React from 'react';

const DeleteProductModal = ({ isOpen, onClose, onConfirm, product }) => {
    // Nếu modal không hiển thị, không render gì cả
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon cảnh báo */}
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.5-1.78 1.638-3.14L12.001 3.51a2.002 2.002 0 00-3.464 0L3.463 17.86C2.598 19.22 3.558 21 5.12 21z" /></svg>
                    </div>

                    {/* Tiêu đề và thông điệp */}
                    <h3 className="text-2xl font-bold text-gray-800">Xóa sản phẩm</h3>
                    <p className="text-gray-600">
                        Bạn có chắc chắn muốn xóa sản phẩm **<span className="font-semibold text-pink-600">{product?.name}</span>** này không?
                        Hành động này không thể hoàn tác.
                    </p>

                    {/* Thông tin sản phẩm */}
                    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl w-full">
                        <img className="w-16 h-16 object-cover rounded-lg" src={product?.mainImage} alt={product?.name} />
                        <div className="flex-1 text-left">
                            <p className="text-gray-800 font-medium">{product?.name}</p>
                            <p className="text-sm text-gray-500">Mã: {product?.Id}</p>
                        </div>
                    </div>
                </div>

                {/* Nút hành động */}
                <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductModal;
