import React from "react"
import { XMarkIcon, CheckIcon, TicketIcon } from "@heroicons/react/24/outline"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"

const VoucherModal = ({
  show,
  onClose,
  customerVouchers,
  selectedVoucher,
  onApplyVoucher,
  staffId
}) => {
  if (!show) return null

  const handleApplyVoucher = async (voucher) => {
    if (!staffId) {
      toast.error("Vui lòng chọn nhân viên!")
      return
    }

    try {
      const dto = {
        staffId,
        code: voucher?.code
      }

      await apiAdmin.post("/pos/cart/apply-voucher", dto)
      onApplyVoucher(voucher)
      onClose()
      toast.success(`Đã áp dụng voucher: ${voucher.code}`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi áp dụng voucher")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TicketIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Chọn voucher</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {customerVouchers.length === 0 ? (
            <div className="text-center py-8">
              <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có voucher khả dụng</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {customerVouchers.map(voucher => (
                <div
                  key={voucher._id}
                  onClick={() => handleApplyVoucher(voucher)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedVoucher?._id === voucher._id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-lg text-gray-800">{voucher.code}</div>
                      <div className="text-sm text-gray-600">{voucher.description}</div>
                    </div>
                    {selectedVoucher?._id === voucher._id && (
                      <CheckIcon className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-orange-600 font-semibold">
                      {voucher.discountType === "percentage"
                        ? `Giảm ${voucher.discountValue}%`
                        : `Giảm ${voucher?.discountValue?.toLocaleString()}₫`}
                    </div>
                    {voucher.minOrderValue > 0 && (
                      <div className="text-gray-500">
                        Đơn tối thiểu: {voucher?.minOrderValue?.toLocaleString()}₫
                      </div>
                    )}
                  </div>

                  {voucher.maxDiscount && voucher.discountType === "percentage" && (
                    <div className="text-xs text-gray-500 mt-1">
                      Giảm tối đa: {voucher?.maxDiscount?.toLocaleString()}₫
                    </div>
                  )}

                  {voucher.expiryDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoucherModal