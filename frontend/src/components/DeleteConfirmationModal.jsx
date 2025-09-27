import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';



const DeleteConfirmationModal = ({ title, message, isOpen, onClose, onConfirm , id}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Header của Modal */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Close modal">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Nội dung của Modal */}
                <div className="mt-4">
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Các nút hành động */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
