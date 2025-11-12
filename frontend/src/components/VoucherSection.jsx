import React, { useState, memo } from "react"
import { Gift, Tag, Sparkles, X } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/service/api"

const VoucherSection = memo(({ 
  voucherCode, 
  setVoucherCode, 
  onApplyVoucher, 
  buyNowData,
  isBuyNow 
}) => {
  const [isApplying, setIsApplying] = useState(false)
  const [isVoucherPopupOpen, setIsVoucherPopupOpen] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState([])

  const openVoucherPopup = async () => {
    try {
      setIsVoucherPopupOpen(true)
      const res = await api.get("/vouchers/available")
      setAvailableVouchers(res.data)
    } catch (err) {
      toast.error("Không thể tải danh sách voucher")
    }
  }

  const handleSelectVoucher = async (code) => {
    setVoucherCode(code)
    setIsVoucherPopupOpen(false)
    await onApplyVoucher(code)
  }

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.warning("Vui lòng nhập mã giảm giá")
      return
    }
    setIsApplying(true)
    await onApplyVoucher(voucherCode)
    setIsApplying(false)
  }

  return (
    <>
      <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <label className="font-bold text-gray-800 text-lg">Mã giảm giá</label>
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        </div>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            placeholder="Nhập mã giảm giá..."
            className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all bg-white shadow-sm"
          />
          <button
            onClick={applyVoucher}
            disabled={isApplying}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
          >
            {isApplying ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Áp dụng"
            )}
          </button>
        </div>
        
        <button
          onClick={openVoucherPopup}
          className="w-full text-center text-sm text-amber-700 font-semibold hover:text-amber-800 transition-colors flex items-center justify-center gap-2 py-2 px-4 bg-white/50 rounded-lg hover:bg-white/80"
        >
          <Tag className="w-4 h-4" />
          Chọn từ voucher có sẵn
        </button>
      </div>

      {/* Voucher Popup */}
      {isVoucherPopupOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative max-h-[85vh] flex flex-col animate-slideUp">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Voucher của bạn
                  </h2>
                </div>
                <button
                  onClick={() => setIsVoucherPopupOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {availableVouchers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    <Gift className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Bạn chưa có voucher nào khả dụng</p>
                  <p className="text-gray-400 text-sm mt-2">Hãy quay lại sau nhé! 😊</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableVouchers.map((v, index) => (
                    <div
                      key={v.code}
                      className="border-2 border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md animate-slideIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg text-gray-800 mb-2 truncate">{v.name}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Mã:</span>
                            <span className="font-mono text-sm text-amber-700 font-bold bg-amber-100 px-3 py-1 rounded-lg">
                              {v.code}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            {v.type === "percent"
                              ? `Giảm ${v.discountValue}%`
                              : v.type === "amount"
                                ? `Giảm ${v.discountValue.toLocaleString()}₫`
                                : "Miễn phí vận chuyển"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectVoucher(v.code)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
})

VoucherSection.displayName = "VoucherSection"

export default VoucherSection