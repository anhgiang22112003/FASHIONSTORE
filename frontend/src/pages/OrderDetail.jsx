import React from 'react'
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Hàm tiện ích (Cần được copy hoặc import từ component cha nếu đặt riêng file)
const getStatusVietnamese = (status) => {
    switch (status) {
        case "PENDING":
            return "Đang chờ xử lý"
        case "PROCESSING":
            return "Đang đóng gói"
        case "SHIPPED":
            return "Đang vận chuyển"
        case "DELIVERED":
            return "Đã giao hàng"
        case "CANCELLED":
            return "Đã hủy"
        default:
            return status
    }
}
const getStatusColor = (status) => {
    switch (status) {
        case "DELIVERED":
            return "bg-green-600 text-white"
        case "CANCELLED":
            return "bg-red-600 text-white"
        case "SHIPPED":
            return "bg-blue-600 text-white"
        case "PENDING":
        case "PROCESSING":
        default:
            return "bg-yellow-600 text-white"
    }
}

const OrderDetail = ({ order, onBack }) => {
    // Tính tổng số lượng sản phẩm
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={onBack}
                className="flex items-center text-pink-600 hover:text-pink-800 transition-colors mb-6 font-medium"
            >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Quay lại Lịch sử đơn hàng
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                {/* Header và Trạng thái */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng #{order._id.substring(0, 8).toUpperCase()}</h1>
                        <p className="text-sm text-gray-500">Đặt vào: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
                    </div>
                    <span className={`text-sm font-bold px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                        {getStatusVietnamese(order.status)}
                    </span>
                </div>

                {/* Thông tin đơn hàng và giao hàng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cột 1: Địa chỉ & Thanh toán */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Thông tin giao hàng</h2>
                        <div className="space-y-2 text-gray-600">
                            <p><strong>Người nhận:</strong> {order.recipientName || 'Khách hàng'}</p>
                            <p><strong>SĐT:</strong> {order.phone || 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> {order.address}</p>
                        </div>
                        
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 pt-4">Thanh toán</h2>
                        <p className="text-gray-600"><strong>Phương thức:</strong> {order.paymentMethod}</p>
                        <p className={`text-sm font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                            Trạng thái thanh toán: {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </p>
                    </div>

                    {/* Cột 2: Tóm tắt */}
                    <div className="md:col-span-1 bg-pink-50 p-6 rounded-xl space-y-4 shadow-inner">
                        <h2 className="text-xl font-bold text-pink-700">Tóm tắt đơn hàng</h2>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>Tổng tiền hàng ({totalItems} món):</span>
                                <span>{order?.subtotal?.toLocaleString()}₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển:</span>
                                <span>{order?.shippingFee?.toLocaleString()}₫</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-lg font-bold">Thành tiền:</span>
                                <span className="text-lg font-bold text-pink-600">{order?.total?.toLocaleString()}₫</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="pt-4 border-t">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Danh sách sản phẩm</h2>
                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b last:border-b-0">
                                <div className="flex items-center space-x-4">
                                    {/* Giả định có trường 'imageUrl' */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5V9.5h2v8h-2z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.productName}</p>
                                        <p className="text-sm text-gray-500">Màu: {item.color} | Size: {item.size}</p>
                                        <p className="text-xs text-gray-400">Đơn giá: {item?.price?.toLocaleString()}₫</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-lg text-pink-600">x{item.quantity}</p>
                                    <p className="text-gray-700 mt-1">
                                        {(item.price * item.quantity)?.toLocaleString()}₫
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetail