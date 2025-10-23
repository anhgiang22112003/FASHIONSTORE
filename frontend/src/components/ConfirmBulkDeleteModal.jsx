// src/components/ConfirmBulkDeleteModal.jsx
import React from "react"

const ConfirmBulkDeleteModal = ({ isOpen, onClose, onConfirm, count }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Xác nhận xóa sản phẩm
        </h2>
        <p className="text-gray-600 mb-6">
          Bạn có chắc muốn xóa <span className="font-semibold text-pink-600">{count}</span> sản phẩm đã chọn không?  
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmBulkDeleteModal
