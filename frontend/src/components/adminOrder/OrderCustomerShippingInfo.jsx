import React from 'react'
import { CheckCircleIcon, ClockIcon, XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline'

const OrderCustomerShippingInfo = ({
    editedOrder,
    handleChange,
    isEditMode,
    canEditFull,
    renderEditableField,
    paymentMethods,
    shippingTypes
}) => {
    // Mapping trạng thái thanh toán
    const paymentStatusMap = {
        'PENDING': { label: 'Chưa thanh toán', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
        'APPROVED': { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
        'DECLINED': { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
        'CANCELLED': { label: 'Đã hủy thanh toán', color: 'bg-gray-100 text-gray-700', icon: XCircleIcon }
    }
    const paymentMethodOptions = {
        COD: "Thanh toán khi nhận hàng",
        BANK: "Chuyển khoản ngân hàng",
        MOMO: "Ví MoMo",
        ZALOPAY: "ZaloPay",
        VNPAY: "VNPay",
        CASH: "Thanh toán tại cửa hàng",
    }

    const shippingTypeOptions = {
        HOA_TOC: "Giao hàng hỏa tốc",
        NHANH: "Giao hàng tiêu chuẩn",
        "": "Mua tại cửa hàng",   // dùng "" thay vì null
    }



    const currentPaymentStatus = editedOrder.paymentStatus || 'PENDING'
    const paymentStatusInfo = paymentStatusMap[currentPaymentStatus] || paymentStatusMap['PENDING']
    const StatusIcon = paymentStatusInfo.icon

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách hàng</h2>
                <div className="space-y-4">
                    {renderEditableField("Tên khách hàng", "customerInfo.name", editedOrder.customerInfo.name)}
                    {renderEditableField("Email", "customerInfo.email", editedOrder.customerInfo.email)}
                    {renderEditableField("Số điện thoại", "customerInfo.phone", editedOrder.customerInfo.phone)}
                    {renderEditableField("Địa chỉ giao hàng", "customerInfo.address", editedOrder.customerInfo.address)}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin vận chuyển</h2>
                <div className="space-y-4">
                    {renderEditableField(
                        "Phương thức giao hàng",
                        "shippingInfo.type",
                        editedOrder.shippingInfo.type ?? "",
                        "text",
                        shippingTypeOptions
                    )}

                    {renderEditableField("Ghi chú", "shippingInfo.note", editedOrder.shippingInfo.note)}
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Thông tin thanh toán</h2>
                <div className="space-y-4">
                    {renderEditableField(
                        "Phương thức thanh toán",
                        "paymentInfo.method",
                        editedOrder.paymentInfo.method,
                        "text",
                        paymentMethodOptions,
                        !canEditFull
                    )}

                    {/* Trạng thái thanh toán */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-500">Trạng thái thanh toán</label>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1.5 rounded-full font-semibold text-sm flex items-center space-x-1.5 ${paymentStatusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span>{paymentStatusInfo.label}</span>
                            </span>
                        </div>
                    </div>

                    {["PENDING", "PROCESSING"].includes(editedOrder.status) &&
                        renderEditableField("Mã giảm giá", "paymentInfo.voucher", editedOrder.paymentInfo.voucher)
                    }
                </div>
            </div>
        </div>
    )
}

export default OrderCustomerShippingInfo