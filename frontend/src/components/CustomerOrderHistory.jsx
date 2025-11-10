import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiAdmin from '@/service/apiAdmin'; 

const getStatusDisplay = (status) => {
    const statusMap = {
        PENDING: { text: 'Đang chờ xác nhận', class: 'bg-yellow-100 text-yellow-800 border-yellow-300' }, // Tối ưu màu chữ
        PROCESSING: { text: 'Đang xử lý', class: 'bg-blue-100 text-blue-800 border-blue-300' },
        SHIPPED: { text: 'Đang vận chuyển', class: 'bg-indigo-600 text-white border-indigo-600' }, // Nổi bật hơn
        COMPLETED: { text: 'Đã hoàn thành', class: 'bg-green-100 text-green-800 border-green-300' },
        CANCELLED: { text: 'Đã hủy', class: 'bg-red-100 text-red-800 border-red-300' },
    };

    const defaultStatus = { text: 'Trạng thái không rõ', class: 'bg-gray-100 text-gray-700 border-gray-300' };
    return statusMap[status] || defaultStatus;
};
const OrderDetailCard = ({ order, onEditOrder }) => {
    const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Lớp Tailwind cho trạng thái
    const { text: statusText, class: statusClass } = getStatusDisplay(order.status?.toUpperCase());

    return (
        <div className="border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow bg-white">
            <div className="flex justify-between items-start mb-3 border-b pb-3">
                {/* ID đơn hàng được hiển thị dưới dạng mã ngắn hơn cho gọn */}
                <h4 className="font-bold text-base text-gray-800 truncate">
                    Đơn hàng #<span className="text-pink-600 font-mono">{order?._id?.slice(-8) || 'N/A'}</span>
                </h4>
                
                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase border ${statusClass}`}>
                    {statusText}
                </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
                <p className="flex justify-between">
                    <span className="font-semibold">Ngày đặt:</span> <span>{formattedDate}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-semibold">Tổng tiền:</span>
                    <span className="text-pink-700 font-bold">
                        {order.total?.toLocaleString('vi-VN') || 0}₫
                    </span>
                </p>
                <p className="flex justify-between">
                    <span className="font-semibold">Sản phẩm:</span> <span>{order?.items?.length || 0} loại</span>
                </p>
            </div>
            
            <button 
                onClick={() => onEditOrder(order._id)} // Đã nối đúng với prop onEditOrder
                className="mt-4 flex items-center text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors border-t border-gray-100 pt-3 w-full justify-center"
            >
                Xem chi tiết <span className="ml-1 text-lg leading-none">&rarr;</span>
            </button>
        </div>
    );
};

const CustomerOrderHistory = ({ customerId, onClose,onEditOrder }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!customerId) {
                toast.error('Không tìm thấy ID khách hàng.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiAdmin.get(`/orders/${customerId}/detail/userAdmin`);
                
                // Giả định API trả về mảng đơn hàng trực tiếp
                setOrders(response.data.orders || response.data); 
                toast.success(`Đã tải ${response.data.orders?.length || response.data.length} đơn hàng.`);
            } catch (error) {
                console.error('Lỗi khi tải lịch sử đơn hàng:', error);
                toast.error(`Lỗi tải đơn hàng: ${error.response?.data?.message || 'Không thể kết nối API.'}`);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [customerId]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-pink-600">
                        🛒 Lịch sử Đơn hàng
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl font-light leading-none"
                    >
                        &times;
                    </button>
                </div>

                {isLoading && (
                    <div className="text-center py-10 text-gray-500">Đang tải đơn hàng...</div>
                )}

                {!isLoading && orders.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Khách hàng này chưa có đơn hàng nào.
                    </div>
                )}

                {!isLoading && orders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orders.map((order) => (
                            <OrderDetailCard onEditOrder={onEditOrder} key={order._id || order.id} order={order} />
                        ))}
                    </div>
                )}

                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-pink-100 text-pink-600 rounded-xl font-semibold hover:bg-pink-200 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrderHistory;