import React from "react";

const ConfirmCompleteModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
          Xác nhận nhận hàng
        </h2>
        <p className="text-gray-700 text-center mb-6">
          Bạn có chắc chắn rằng mình đã nhận được hàng và muốn hoàn thành đơn không?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm()}
            className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCompleteModal;
