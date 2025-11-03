import React, { useEffect, useState } from 'react';
import apiUser from '@/service/api';
import { toast } from 'react-toastify';
import {
    ClockIcon, CubeIcon, TruckIcon, CreditCardIcon, StarIcon
} from '@heroicons/react/24/outline';
import ProductReviewForm from '@/pages/ProductReviewForm'
import CancelOrderModal from './CancelOrderModal';
import ConfirmCompleteModal from './ConfirmCompleteModal';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, } from '@heroicons/react/24/outline';

// Định nghĩa trạng thái Đơn hàng và ánh xạ sang Tiếng Việt
const ORDER_STATUS_MAP = {
    PENDING: { label: 'Chờ Xác Nhận', icon: ClockIcon, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    PROCESSING: { label: 'Đang Xử Lý', icon: CubeIcon, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    SHIPPED: { label: 'Đang Giao Hàng', icon: TruckIcon, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    COMPLETED: { label: 'Đã Hoàn Thành', icon: CheckCircleIcon, color: 'bg-green-100 text-green-700 border-green-300' },
    CANCELLED: { label: 'Đã Hủy', icon: XCircleIcon, color: 'bg-red-100 text-red-700 border-red-300' },
};

// Định nghĩa trạng thái THANH TOÁN và ánh xạ sang Tiếng Việt
const PAYMENT_STATUS_MAP = {
    PENDING: { label: 'Chưa Thanh Toán', icon: ClockIcon, color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
    APPROVED: { label: 'Đã Thanh Toán', icon: CheckCircleIcon, color: 'text-green-600 bg-green-50 border-green-300' },
    DECLINED: { label: 'Thanh Toán Thất Bại', icon: ExclamationTriangleIcon, color: 'text-red-600 bg-red-50 border-red-300' },
    CANCELLED: { label: 'Đã Hủy Thanh Toán', icon: XCircleIcon, color: 'text-gray-600 bg-gray-50 border-gray-300' },
};
const OrderDetails = ({ id, onBack }) => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);


    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await apiUser.get(`/orders/${id}`);
            setOrderData(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể lấy chi tiết đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);
    // Xử lý cập nhật trạng thái đơn hàng
    const handleUpdateStatus = async (status) => {
        let note = "";

        // Nếu người dùng chọn hủy, hiển thị popup chọn lý do
        if (status === "CANCELLED") {
            const reasons = [
                "Đặt nhầm sản phẩm",
                "Muốn đổi sang sản phẩm khác",
                "Thay đổi địa chỉ nhận hàng",
                "Không còn nhu cầu mua",
                "Khác (ghi chú riêng)"
            ];
            const reasonText = prompt(
                `Chọn hoặc nhập lý do hủy đơn:\n${reasons
                    .map((r, i) => `${i + 1}. ${r}`)
                    .join("\n")}`
            );

            if (!reasonText) return; // Người dùng bấm Cancel
            // Nếu nhập số 1-5, tự map sang lý do
            note = Number(reasonText)
                ? reasons[Number(reasonText) - 1]
                : reasonText;
        }

        if (status === "COMPLETED") {
            if (!window.confirm("✅ Xác nhận bạn đã nhận hàng thành công?")) return;
            note = "Khách hàng xác nhận đã nhận hàng.";
        }

        try {
            await apiUser.patch(`/orders/${id}/status`, { status, note });
            toast.success(
                status === "CANCELLED"
                    ? "Đã hủy đơn hàng thành công!"
                    : "Đã xác nhận nhận hàng thành công!"
            );
            fetchOrder(); // cập nhật lại UI
        } catch (error) {
            toast.error(error?.response?.data?.message || "Cập nhật trạng thái thất bại.");
        }
    };

    const formatCurrency = (amount) => `${amount?.toLocaleString('vi-VN')}₫`;

    const currentStatus = orderData?.status;
    const currentPaymentStatus = orderData?.paymentStatus || 'PENDING';

    const isCancellable = currentStatus === 'PENDING' || currentStatus === 'PROCESSING';
    const isCompletable = currentStatus === 'SHIPPED';

    const handleConfirmCancel = async (reason) => {
        setIsCancelling(true);
        try {
            await apiUser.patch(`/orders/${id}/status`, {
                status: "CANCELLED",
                note: reason,
            });
            toast.success("Đã hủy đơn hàng thành công!");
            fetchOrder();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể hủy đơn hàng.");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirmComplete = async () => {
        setIsCompleting(true);
        try {
            await apiUser.patch(`/orders/${id}/status`, {
                status: "COMPLETED",
                note: "Khách hàng xác nhận đã nhận hàng.",
            });
            toast.success("Đã xác nhận nhận hàng thành công!");
            fetchOrder();
            setShowCompleteModal(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái.");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleBankPayment = async (invoiceNumber, totalAmount) => {
        try {
            const res = await api.post("/sepay-webhook/create-payment", {
                invoiceNumber,
                amount: totalAmount,
                description: `Thanh toán đơn hàng ${invoiceNumber}`,
            })

            const { checkoutURL, formFields } = res.data

            // Tạo form và submit tự động
            const formEl = document.createElement("form")
            formEl.action = checkoutURL
            formEl.method = "POST"
            Object.keys(formFields).forEach(key => {
                const input = document.createElement("input")
                input.type = "hidden"
                input.name = key
                input.value = formFields[key]
                formEl.appendChild(input)
            })
            document.body.appendChild(formEl)
            formEl.submit()
        } catch (err) {
            toast.error("Tạo thanh toán thất bại")
            console.error(err)
        }
    }
    if (loading) return <p className="text-center py-10 text-lg">Đang tải chi tiết đơn hàng...</p>;
    if (!orderData) return <p className="text-center py-10 text-lg text-red-500">Không tìm thấy dữ liệu đơn hàng</p>;

    const statusInfo = ORDER_STATUS_MAP[currentStatus] || { label: currentStatus, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: ClockIcon };
    const StatusIcon = statusInfo.icon;

    const paymentStatusInfo = PAYMENT_STATUS_MAP[currentPaymentStatus] || { label: currentPaymentStatus, color: 'text-gray-600 bg-gray-50' };
    console.log(currentStatus);

    return (
        <div className="min-h-screen font-sans antialiased">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-200">
                {/* Header và Trạng thái hiện tại */}
                <button onClick={onBack} className="flex items-center text-pink-600 hover:text-pink-700 font-medium transition-colors mb-6">
                    &larr; Quay lại danh sách đơn hàng
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-pink-100">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-extrabold text-gray-900">Chi Tiết Đơn Hàng</h2>
                        <p className="text-gray-500 text-lg">Mã đơn hàng: <span className="font-mono font-semibold text-gray-700">#{orderData._id.substring(0, 10).toUpperCase()}</span></p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <span className={`flex items-center px-4 py-2 rounded-full font-bold text-sm border-2 ${statusInfo.color}`}>
                            <StatusIcon className="w-5 h-5 mr-2" />
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* Các Nút Hành Động */}
                <div className="flex justify-end space-x-3">
                    {currentPaymentStatus === 'DECLINED' && orderData.paymentMethod !== 'COD' && (
                        <button
                            onClick={() => handleBankPayment(orderData._id, orderData.total)}
                            className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            💳 Thanh toán lại
                        </button>
                    )}
                    {/* Nút Nhận hàng thành công */}
                    <button
                        onClick={() => setShowCompleteModal(true)}
                        disabled={!isCompletable}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md
    ${isCompletable
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        ✅ Nhận hàng thành công
                    </button>

                    {/* Nút Hủy đơn hàng */}
                    <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={!isCancellable || isCancelling}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md
      ${isCancellable
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {isCancelling ? 'Đang hủy...' : '❌ Hủy đơn hàng'}
                    </button>
                </div>

                {/* Nội dung chính 3 cột */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Timeline lịch sử đơn hàng */}
                    <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-pink-100">
                        <h3 className="text-2xl font-bold text-pink-600 flex items-center"><ClockIcon className="w-6 h-6 mr-2" /> Lịch Sử Đơn Hàng</h3>
                        <div className="relative border-l-2 border-pink-300 pl-6 space-y-8 mt-6">
                            {orderData.orderHistory?.map((step, index) => {
                                const stepStatusInfo = ORDER_STATUS_MAP[step.status] || { label: step.status, color: 'text-gray-800', icon: ClockIcon };
                                return (
                                    <div key={index} className="relative">
                                        <span className={`absolute -left-3 top-0 transform -translate-x-1/2 w-5 h-5 rounded-full border-2 ${step.status === currentStatus ? 'border-pink-500 bg-pink-500' : 'border-gray-300 bg-white'}`}></span>
                                        <div className="space-y-1">
                                            <p className={`font-bold ${step.status === currentStatus ? 'text-pink-600' : 'text-gray-800'}`}>
                                                {stepStatusInfo.label}
                                            </p>
                                            <p className="text-sm text-gray-600 italic">{step.note}</p>
                                            <p className="text-xs text-gray-400">{new Date(step.changedAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Thông tin giao hàng & người mua */}
                    <div className="space-y-8">
                        {/* Thông tin giao hàng */}
                        <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-pink-100">
                            <h3 className="text-2xl font-bold text-pink-600 flex items-center"><TruckIcon className="w-6 h-6 mr-2" /> Thông Tin Giao Hàng</h3>
                            <div className="space-y-3 text-gray-700 text-base">
                                <p><span className="font-semibold text-gray-800">Người nhận:</span> {orderData.shippingInfo?.name}</p>
                                <p><span className="font-semibold text-gray-800">Điện thoại:</span> {orderData.shippingInfo?.phone}</p>
                                <p><span className="font-semibold text-gray-800">Địa chỉ:</span> {orderData.address}</p>
                                <p><span className="font-semibold text-gray-800">Phương thức:</span> {orderData.shippingMethod}</p>
                            </div>
                        </div>

                        {/* Thông tin Thanh toán */}
                        <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-pink-100">
                            <h3 className="text-2xl font-bold text-pink-600 flex items-center"><CreditCardIcon className="w-6 h-6 mr-2" /> Thông Tin Thanh Toán</h3>
                            <div className="space-y-3 text-gray-700 text-base">
                                <p><span className="font-semibold text-gray-800">Hình thức TT:</span> {orderData.paymentMethod}</p>
                                <p className="flex items-center">
                                    <span className="font-semibold text-gray-800 mr-2">Trạng thái TT:</span>
                                    <span className={`flex items-center space-x-1 px-3 py-1 border rounded-full text-sm font-semibold ${paymentStatusInfo.color}`}>
                                        <paymentStatusInfo.icon className="w-4 h-4" />
                                        <span>{paymentStatusInfo.label}</span>
                                    </span>
                                </p>

                                {orderData.voucherCode && <p><span className="font-semibold text-gray-800">Mã Voucher:</span> <span className="font-mono text-pink-600">{orderData.voucherCode}</span></p>}
                                {orderData.note && <p><span className="font-semibold text-gray-800">Ghi chú:</span> <span className="italic">{orderData.note}</span></p>}
                            </div>
                        </div>
                    </div>

                    {/* Tổng kết thanh toán */}
                    <div className="bg-pink-50 rounded-2xl p-6 space-y-4 shadow-lg border border-pink-200 h-fit">
                        <h3 className="text-2xl font-bold text-pink-700">Tổng Kết Thanh Toán</h3>
                        <div className="space-y-3 text-base">
                            <div className="flex justify-between">
                                <p className="text-gray-700">Tạm tính:</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(orderData.subtotal)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-700">Phí vận chuyển:</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(orderData.shipping)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-700">Giảm giá:</p>
                                <p className="font-semibold text-red-500">- {formatCurrency(orderData.discount)}</p>
                            </div>
                            <div className="flex justify-between font-extrabold text-2xl pt-4 border-t border-pink-200">
                                <p className="text-gray-800">TỔNG CỘNG:</p>
                                <p className="text-pink-600">{formatCurrency(orderData.total)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chi tiết sản phẩm */}
                <div className="bg-white rounded-2xl p-6 space-y-6 shadow-2xl border border-gray-200 mt-8">
                    <h4 className="text-2xl font-bold text-gray-800">Chi Tiết Sản Phẩm</h4>
                    <div className="divide-y divide-gray-100">
                        {orderData.items?.map((product, index) => (
                            <div key={index} className="flex items-center space-x-4 py-4 first:pt-0 last:pb-0">
                                <img
                                    src={product.image || 'https://placehold.co/100x100/f0d1de/ffffff?text=Product'}
                                    alt={product.productName}
                                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-gray-900">{product.productName}</p>
                                    <p className="text-sm text-gray-500">Màu: {product.color} | Size: {product.size} | SL: {product.quantity}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-pink-600 text-lg">{formatCurrency(product.price)}</p>
                                    <p className="text-sm text-gray-400">({formatCurrency(product.price / product.quantity)} /cái)</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔥 PHẦN ĐÁNH GIÁ SẢN PHẨM - CHỈ HIỂN THỊ KHI ĐƠN HÀNG HOÀN THÀNH */}
                {currentStatus === "COMPLETED" && (
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 space-y-6 shadow-xl border-2 border-pink-200 mt-8">
                        <div className="flex items-center space-x-3 pb-4 border-b-2 border-pink-200">
                            <StarIcon className="w-8 h-8 text-pink-600" />
                            <h3 className="text-3xl font-extrabold text-gray-900">Đánh Giá Sản Phẩm</h3>
                        </div>
                        <p className="text-gray-600 text-base italic">
                            Cảm ơn bạn đã hoàn thành đơn hàng! Hãy để lại đánh giá để giúp chúng tôi cải thiện dịch vụ.
                        </p>
                        <div className="space-y-6">
                            {orderData.items?.map((item, index) => (
                                <ProductReviewForm
                                    key={index}
                                    item={item}
                                    userId={orderData.user?._id || orderData.user}
                                    orderId={orderData._id}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <CancelOrderModal
                open={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
            />

            <ConfirmCompleteModal
                open={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                onConfirm={handleConfirmComplete}
            />

        </div>
    );
};

export default OrderDetails;