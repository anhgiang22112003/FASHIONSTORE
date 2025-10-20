import React from 'react'

const OrderCustomerShippingInfo = ({ editedOrder, handleChange, isEditMode, canEditFull, renderEditableField, paymentMethods, shippingTypes }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách hàng</h2>
                {renderEditableField("Tên khách hàng", "customerInfo.name", editedOrder.customerInfo.name)}
                {renderEditableField("Email", "customerInfo.email", editedOrder.customerInfo.email)}
                {renderEditableField("Số điện thoại", "customerInfo.phone", editedOrder.customerInfo.phone)}
                {renderEditableField("Địa chỉ giao hàng", "customerInfo.address", editedOrder.customerInfo.address)}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin vận chuyển</h2>
                {renderEditableField("Phương thức giao hàng", "shippingInfo.type", editedOrder.shippingInfo.type)}
                {renderEditableField("Đơn vị giao hàng", "shippingInfo.unit", editedOrder.shippingInfo.unit)}
                {renderEditableField("Ghi chú", "shippingInfo.note", editedOrder.shippingInfo.note)}

                <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Thông tin thanh toán</h2>
                {renderEditableField("Phương thức thanh toán", "paymentInfo.method", editedOrder.paymentInfo.method, "text", paymentMethods, !canEditFull)}
                {["PENDING", "PROCESSING"].includes(editedOrder.status) &&
                    renderEditableField("Mã giảm giá", "paymentInfo.voucher", editedOrder.paymentInfo.voucher)
                }
            </div>
        </div>
    )
}

export default OrderCustomerShippingInfo