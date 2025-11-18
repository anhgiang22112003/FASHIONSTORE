import React from "react"
import { PercentBadgeIcon, TicketIcon } from "@heroicons/react/24/outline"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"

const DiscountManager = ({
    subtotal,
    discountType,
    setDiscountType,
    discountValue,
    discountPercent,
    setDiscountPercent,
    discountAmount,
    setDiscountAmount,
    selectedVoucher,
    setSelectedVoucher,
    selectedCustomer,
    customerVouchers,
    setShowVoucherModal,
    onRemoveDiscount,
    staffId
}) => {
    // Apply manual discount (percent or amount)
    const handleApplyManualDiscount = async () => {
        if (!staffId) return toast.error("Vui lòng chọn nhân viên!")

        let manualDiscount = 0

        if (discountType === "PERCENT") {
            if (discountPercent <= 0) return toast.error("Nhập % chiết khấu!")
            manualDiscount = Math.floor((subtotal * discountPercent) / 100)
        }

        if (discountType === "AMOUNT") {
            if (discountAmount <= 0) return toast.error("Nhập số tiền chiết khấu!")
            manualDiscount = discountAmount
        }

        try {
            await apiAdmin.post("/pos/cart/manual-discount", {
                staffId,
                manualDiscount
            })

            toast.success("Áp dụng chiết khấu thành công!")
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi áp dụng chiết khấu")
        }
    }

    // Apply voucher discount

    const handleDiscountTypeChange = (e) => {
        const newType = e.target.value
        setDiscountType(newType)
        if (newType === "NONE") {
            onRemoveDiscount()
        }
    }

    return (
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <PercentBadgeIcon className="w-4 h-4 text-orange-500" />
                    Chiết khấu
                </label>
                {discountType !== "NONE" && (
                    <button
                        onClick={onRemoveDiscount}
                        className="text-xs text-red-500 hover:text-red-700"
                    >
                        Xóa
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <select
                    value={discountType}
                    onChange={handleDiscountTypeChange}
                    className="w-full px-3 py-2 text-black text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                    <option value="NONE">Không chiết khấu</option>
                    <option value="PERCENT">Chiết khấu theo %</option>
                    <option value="AMOUNT">Chiết khấu theo số tiền</option>
                    {selectedCustomer && customerVouchers.length > 0 && (
                        <option value="VOUCHER">Sử dụng voucher</option>
                    )}
                </select>

                {discountType === "PERCENT" && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discountPercent}
                                onChange={(e) => {
                                    let value = Number(e.target.value)
                                    if (value > 100) value = 100       // giới hạn tối đa 100%
                                    if (value < 0) value = 0           // giới hạn tối thiểu 0%
                                    setDiscountPercent(value)
                                }}
                                className="flex-1 px-3 py-2 text-black text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Nhập %"
                            />

                            <span className="text-sm text-gray-600">%</span>
                        </div>
                        {/* <button
              onClick={handleApplyManualDiscount}
              className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
            >
              Áp dụng chiết khấu
            </button> */}
                    </div>
                )}

                {discountType === "AMOUNT" && (
                    <div className="space-y-2">
                        <input
                            type="number"
                            min="0"
                            max={subtotal}
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 text-black text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Nhập số tiền"
                        />
                        {/* <button
              onClick={handleApplyManualDiscount}
              className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
            >
              Áp dụng chiết khấu
            </button> */}
                    </div>
                )}

                {discountType === "VOUCHER" && selectedVoucher && (
                    <div className="p-3 bg-white rounded-lg border border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-gray-800">{selectedVoucher.code}</div>
                                <div className="text-xs text-gray-600">
                                    {selectedVoucher.discountType === "percentage"
                                        ? `Giảm ${selectedVoucher.discountValue}%`
                                        : `Giảm ${selectedVoucher.discountValue.toLocaleString()}₫`}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowVoucherModal(true)}
                                className="text-xs text-orange-600 hover:text-orange-700"
                            >
                                Đổi
                            </button>
                        </div>
                    </div>
                )}

                {discountType === "VOUCHER" && !selectedVoucher && (
                    <button
                        onClick={() => setShowVoucherModal(true)}
                        className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Chọn voucher
                    </button>
                )}

                {discountValue > 0 && (
                    <div className="text-sm text-orange-600 font-medium">
                        Giảm: -{discountValue.toLocaleString()} ₫
                    </div>
                )}
            </div>
        </div>
    )
}

export default DiscountManager