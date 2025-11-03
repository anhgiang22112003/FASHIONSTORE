import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const CancelOrderModal = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    "Đặt nhầm sản phẩm",
    "Muốn thay đổi địa chỉ giao hàng",
    "Thời gian giao hàng quá lâu",
    "Tìm được giá tốt hơn ở nơi khác",
    "Khác...",
  ];

  const handleSubmit = () => {
    const finalReason =
      reason === "Khác..." && customReason ? customReason : reason;
    if (!finalReason) return alert("Vui lòng chọn hoặc nhập lý do hủy!");
    onConfirm(finalReason);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
    >
      <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-xl font-bold text-gray-800">
            Hủy đơn hàng
          </Dialog.Title>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Vui lòng chọn lý do bạn muốn hủy đơn hàng này:
        </p>

        <div className="space-y-3 mb-4">
          {reasons.map((r) => (
            <label
              key={r}
              className="flex items-center space-x-2 text-gray-700 cursor-pointer"
            >
              <input
                type="radio"
                name="cancelReason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="text-pink-600 focus:ring-pink-500"
              />
              <span>{r}</span>
            </label>
          ))}

          {reason === "Khác..." && (
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Nhập lý do khác..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white bg-pink-600 hover:bg-pink-700"
          >
            Xác nhận hủy đơn
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default CancelOrderModal;
