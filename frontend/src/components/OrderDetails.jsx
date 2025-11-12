import React, { useEffect, useState, useMemo, useCallback } from 'react';
import apiUser from '@/service/api';
import { toast } from 'react-toastify';
import {
  Clock, Package, Truck, CreditCard, Star, AlertTriangle, CheckCircle, XCircle, ArrowLeft, MapPin, User, Phone, Gift, DollarSign
} from 'lucide-react';

import ProductReviewForm from '@/pages/ProductReviewForm'
import CancelOrderModal from './CancelOrderModal';
import ConfirmCompleteModal from './ConfirmCompleteModal';

const ORDER_STATUS_MAP = {
    PENDING: { label: 'Chờ Xác Nhận', icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    PROCESSING: { label: 'Đang Xử Lý', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    SHIPPED: { label: 'Đang Giao Hàng', icon: Truck, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    COMPLETED: { label: 'Đã Hoàn Thành', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-300' },
    CANCELLED: { label: 'Đã Hủy', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-300' },
};

const PAYMENT_STATUS_MAP = {
    PENDING: { label: 'Chưa Thanh Toán', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
    APPROVED: { label: 'Đã Thanh Toán', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-300' },
    DECLINED: { label: 'Thanh Toán Thất Bại', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-300' },
    CANCELLED: { label: 'Đã Hủy Thanh Toán', icon: XCircle, color: 'text-gray-600 bg-gray-50 border-gray-300' },
};

const OrderDetails = ({ id, onBack }) => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiUser.get(`/orders/${id}`);
            setOrderData(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể lấy chi tiết đơn hàng');
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleConfirmCancel = async (reason) => {
        setIsCancelling(true);
        try {
            await apiUser.patch(`/orders/${id}/status/user`, {
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
            await apiUser.patch(`/orders/${id}/status/user`, {
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
            const res = await apiUser.post("/sepay-webhook/create-payment", {
                invoiceNumber,
                amount: totalAmount,
                description: `Thanh toán đơn hàng ${invoiceNumber}`,
            })

            const { checkoutURL, formFields } = res.data

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

    const formatCurrency = useCallback((amount) => `${amount?.toLocaleString('vi-VN')}₫`, []);

    const currentStatus = useMemo(() => orderData?.status, [orderData?.status]);
    const currentPaymentStatus = useMemo(() => orderData?.paymentStatus || 'PENDING', [orderData?.paymentStatus]);

    const isCancellable = useMemo(() => currentStatus === 'PENDING' || currentStatus === 'PROCESSING', [currentStatus]);
    const isCompletable = useMemo(() => currentStatus === 'SHIPPED', [currentStatus]);

    const statusInfo = useMemo(() => ORDER_STATUS_MAP[currentStatus] || { label: currentStatus, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Clock }, [currentStatus]);
    const StatusIcon = statusInfo.icon;

    const paymentStatusInfo = useMemo(() => PAYMENT_STATUS_MAP[currentPaymentStatus] || { label: currentPaymentStatus, color: 'text-gray-600 bg-gray-50' }, [currentPaymentStatus]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-8">
                <div className="max-w-7xl mx-auto animate-pulse space-y-6">
                    <div className="h-12 bg-gray-200 rounded-2xl w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!orderData) return <p className="text-center py-10 text-lg text-red-500 font-bold">Không tìm thấy dữ liệu đơn hàng</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 font-sans antialiased">
            <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 animate-slideUp">
                {/* Header */}
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold transition-all mb-6 px-4 py-2 rounded-xl hover:bg-pink-50 active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại danh sách đơn hàng
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b-2 border-pink-200">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Chi Tiết Đơn Hàng</h2>
                        <p className="text-gray-600 text-lg font-medium">
                            Mã đơn hàng: <span className="font-mono font-black text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">#{orderData._id.substring(0, 10).toUpperCase()}</span>
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <span className={`flex items-center px-5 py-2.5 rounded-full font-black text-sm border-2 shadow-md ${statusInfo.color}`}>
                            <StatusIcon className="w-5 h-5 mr-2" />
                            {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-end gap-3">
                    {currentPaymentStatus === 'DECLINED' && orderData.paymentMethod !== 'COD' && (
                        <button
                            onClick={() => handleBankPayment(orderData._id, orderData.total)}
                            className="flex items-center px-5 py-3 rounded-xl text-sm font-black transition-all shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white active:scale-95"
                        >
                            💳 Thanh toán lại
                        </button>
                    )}
                    <button
                        onClick={() => setShowCompleteModal(true)}
                        disabled={!isCompletable}
                        className={`flex items-center px-5 py-3 rounded-xl text-sm font-black transition-all shadow-lg ${
                            isCompletable
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white active:scale-95'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        ✅ Nhận hàng thành công
                    </button>

                    <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={!isCancellable || isCancelling}
                        className={`flex items-center px-5 py-3 rounded-xl text-sm font-black transition-all shadow-lg ${
                            isCancellable
                                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white active:scale-95'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        {isCancelling ? 'Đang hủy...' : '❌ Hủy đơn hàng'}
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Timeline */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 space-y-4 shadow-lg border-2 border-pink-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">Lịch Sử Đơn Hàng</h3>
                        </div>
                        <div className="relative border-l-4 border-pink-400 pl-6 space-y-6 mt-6">
                            {orderData.orderHistory?.map((step, index) => {
                                const stepStatusInfo = ORDER_STATUS_MAP[step.status] || { label: step.status, color: 'text-gray-800', icon: Clock };
                                return (
                                    <div key={index} className="relative">
                                        <span className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full border-4 ${step.status === currentStatus ? 'border-pink-500 bg-pink-500 shadow-lg' : 'border-gray-300 bg-white'}`}></span>
                                        <div className="space-y-1">
                                            <p className={`font-black text-lg ${step.status === currentStatus ? 'text-pink-600' : 'text-gray-800'}`}>
                                                {stepStatusInfo.label}
                                            </p>
                                            <p className="text-sm text-gray-600 font-medium italic">{step.note}</p>
                                            <p className="text-xs text-gray-400">{new Date(step.changedAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Shipping & Payment Info */}
                    <div className="space-y-6">
                        {/* Shipping Info */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 space-y-4 shadow-lg border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <Truck className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800">Thông Tin Giao Hàng</h3>
                            </div>
                            <div className="space-y-3 text-gray-700 text-base">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-gray-800">Người nhận:</span> {orderData.shippingInfo?.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-gray-800">Điện thoại:</span> {orderData.shippingInfo?.phone}
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                    <div>
                                        <span className="font-bold text-gray-800">Địa chỉ:</span>
                                        <p className="text-sm">{orderData.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-gray-800">Phương thức:</span> {orderData.shippingMethod}
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 space-y-4 shadow-lg border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800">Thông Tin Thanh Toán</h3>
                            </div>
                            <div className="space-y-3 text-gray-700 text-base">
                                <p><span className="font-bold text-gray-800">Hình thức TT:</span> {orderData.paymentMethod}</p>
                                <p className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">Trạng thái TT:</span>
                                    <span className={`flex items-center space-x-1 px-3 py-1.5 border-2 rounded-full text-sm font-black shadow-sm ${paymentStatusInfo.color}`}>
                                        <paymentStatusInfo.icon className="w-4 h-4" />
                                        <span>{paymentStatusInfo.label}</span>
                                    </span>
                                </p>
                                {orderData.voucherCode && (
                                    <div className="flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-purple-600" />
                                        <span className="font-bold text-gray-800">Mã Voucher:</span> 
                                        <span className="font-mono text-pink-600 font-black bg-pink-100 px-2 py-1 rounded">{orderData.voucherCode}</span>
                                    </div>
                                )}
                                {orderData.note && <p><span className="font-bold text-gray-800">Ghi chú:</span> <span className="italic">{orderData.note}</span></p>}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 space-y-4 shadow-lg border-2 border-orange-200 h-fit">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">Tổng Kết Thanh Toán</h3>
                        </div>
                        <div className="space-y-3 text-base">
                            <div className="flex justify-between items-center py-2">
                                <p className="text-gray-700 font-semibold">Tạm tính:</p>
                                <p className="font-black text-gray-900">{formatCurrency(orderData.subtotal)}</p>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <p className="text-gray-700 font-semibold">Phí vận chuyển:</p>
                                <p className="font-black text-gray-900">{formatCurrency(orderData.shipping)}</p>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <p className="text-gray-700 font-semibold">Giảm giá:</p>
                                <p className="font-black text-red-500">- {formatCurrency(orderData.discount)}</p>
                            </div>
                            <div className="flex justify-between items-center font-black text-2xl pt-4 border-t-2 border-orange-300">
                                <p className="text-gray-800">TỔNG CỘNG:</p>
                                <p className="text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{formatCurrency(orderData.total)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-3xl p-6 space-y-6 shadow-xl border-2 border-gray-200 mt-8">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-2xl font-black text-gray-800">Chi Tiết Sản Phẩm</h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {orderData.items?.map((product, index) => (
                            <div key={index} className="flex items-center space-x-4 py-4 first:pt-0 last:pb-0 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-xl px-4 transition-all">
                                <img
                                    src={product.image || 'https://placehold.co/100x100/f0d1de/ffffff?text=Product'}
                                    alt={product.productName}
                                    className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0 shadow-md"
                                />
                                <div className="flex-1">
                                    <p className="font-black text-lg text-gray-900 mb-1">{product.productName}</p>
                                    <p className="text-sm text-gray-600 font-medium">Màu: {product.color} | Size: {product.size} | SL: {product.quantity}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-black text-pink-600 text-xl">{formatCurrency(product.price)}</p>
                                    <p className="text-sm text-gray-400 font-medium">({formatCurrency(product.price / product.quantity)} /cái)</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Review Section */}
                {currentStatus === "COMPLETED" && (
                    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl p-8 space-y-6 shadow-2xl border-2 border-amber-300 mt-8 animate-slideUp">
                        <div className="flex items-center space-x-3 pb-4 border-b-2 border-amber-300">
                            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                <Star className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900">Đánh Giá Sản Phẩm</h3>
                        </div>
                        <p className="text-gray-700 text-base font-medium italic">
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

            <style jsx>{`
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

                .animate-slideUp {
                    animation: slideUp 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default OrderDetails;