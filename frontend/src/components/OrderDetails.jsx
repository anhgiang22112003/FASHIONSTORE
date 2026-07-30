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
            setLoading(false);
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

    const formatCurrency = useCallback((amount) => `${(amount || 0).toLocaleString('vi-VN')}₫`, []);

    const currentStatus = useMemo(() => orderData?.status, [orderData?.status]);
    const currentPaymentStatus = useMemo(() => orderData?.paymentStatus || 'PENDING', [orderData?.paymentStatus]);

    const isCancellable = useMemo(() => currentStatus === 'PENDING' || currentStatus === 'PROCESSING', [currentStatus]);
    const isCompletable = useMemo(() => currentStatus === 'SHIPPED', [currentStatus]);

    const statusInfo = useMemo(() => ORDER_STATUS_MAP[currentStatus] || { label: currentStatus, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Clock }, [currentStatus]);
    const StatusIcon = statusInfo.icon;

    const paymentStatusInfo = useMemo(() => PAYMENT_STATUS_MAP[currentPaymentStatus] || { label: currentPaymentStatus, color: 'text-gray-600 bg-gray-50' }, [currentPaymentStatus]);

    // Các bước tiến trình đơn hàng (Stepper Bar)
    const steps = [
        { key: 'PENDING', label: 'Đặt hàng', icon: Clock },
        { key: 'PROCESSING', label: 'Đang xử lý', icon: Package },
        { key: 'SHIPPED', label: 'Đang giao', icon: Truck },
        { key: 'COMPLETED', label: 'Hoàn tất', icon: CheckCircle },
    ];

    const currentStepIndex = useMemo(() => {
        if (currentStatus === 'CANCELLED') return -1;
        return steps.findIndex(s => s.key === currentStatus);
    }, [currentStatus]);

    if (loading) {
        return (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8 animate-pulse space-y-6">
                <div className="h-10 bg-gray-200 rounded-xl w-1/4"></div>
                <div className="h-24 bg-gray-100 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-48 bg-gray-100 rounded-2xl"></div>
                    <div className="h-48 bg-gray-100 rounded-2xl"></div>
                    <div className="h-48 bg-gray-100 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!orderData) return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center shadow-xl border border-white/20">
            <XCircle className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-bounce" />
            <p className="text-xl font-bold text-gray-800">Không tìm thấy dữ liệu đơn hàng</p>
            <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold shadow-md hover:from-pink-600 hover:to-purple-700">
                Quay lại danh sách
            </button>
        </div>
    );

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-8 animate-slideUp font-sans antialiased">
            {/* Navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-pink-100">
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-pink-600 hover:text-purple-600 font-bold transition-all px-4 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 active:scale-95 shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Quay lại đơn hàng</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500">Trạng thái:</span>
                    <span className={`flex items-center px-4 py-2 rounded-full font-bold text-sm border shadow-sm ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            {/* Banner Đơn hàng */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <p className="text-pink-200 text-sm font-bold uppercase tracking-wider mb-1">Chi tiết đơn hàng</p>
                    <h2 className="text-3xl sm:text-4xl font-black font-mono">#{orderData._id.substring(0, 10).toUpperCase()}</h2>
                    <p className="text-sm text-pink-100 mt-2 font-medium">
                        Ngày đặt: {new Date(orderData.createdAt).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {currentPaymentStatus === 'DECLINED' && orderData.paymentMethod !== 'COD' && (
                        <button
                            onClick={() => handleBankPayment(orderData._id, orderData.total)}
                            className="px-5 py-3 rounded-2xl font-bold bg-white text-pink-600 hover:bg-pink-50 transition-all shadow-lg active:scale-95 flex items-center gap-2 text-sm"
                        >
                            <CreditCard className="w-4 h-4" />
                            Thanh toán lại
                        </button>
                    )}
                    {isCompletable && (
                        <button
                            onClick={() => setShowCompleteModal(true)}
                            className="px-5 py-3 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 text-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Đã nhận hàng
                        </button>
                    )}
                    {isCancellable && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={isCancelling}
                            className="px-5 py-3 rounded-2xl font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 flex items-center gap-2 text-sm border border-white/30"
                        >
                            <XCircle className="w-4 h-4" />
                            {isCancelling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stepper bar (Tiến trình đơn hàng) */}
            {currentStatus !== 'CANCELLED' ? (
                <div className="bg-gradient-to-r from-pink-50/50 via-purple-50/50 to-indigo-50/50 rounded-3xl p-6 border border-pink-100/60 shadow-sm">
                    <h3 className="text-base font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-pink-500" />
                        Tiến trình xử lý đơn hàng
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                        {steps.map((step, idx) => {
                            const StepIcon = step.icon;
                            const isDone = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-md ${
                                        isCurrent 
                                            ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white scale-110 ring-4 ring-pink-200' 
                                            : isDone 
                                                ? 'bg-purple-100 text-purple-600' 
                                                : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <StepIcon className="w-6 h-6" />
                                    </div>
                                    <p className={`text-sm font-bold mt-3 ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                                    {isCurrent && <span className="text-xs text-pink-600 font-extrabold mt-0.5">● Hiện tại</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 flex items-center gap-4 text-red-700">
                    <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-lg">Đơn hàng này đã bị hủy</p>
                        <p className="text-sm text-red-600">Nếu có thắc mắc vui lòng liên hệ với bộ phận CSKH để được trợ giúp.</p>
                    </div>
                </div>
            )}

            {/* Thông tin Giao hàng & Thanh toán & Tổng tiền */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Giao hàng */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Thông tin nhận hàng</h3>
                    </div>
                    <div className="space-y-2.5 text-sm text-gray-600">
                        <p className="flex items-center gap-2 font-bold text-gray-800 text-base">
                            <User className="w-4 h-4 text-pink-500" />
                            {orderData.shippingInfo?.name || orderData.user?.name}
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                            <Phone className="w-4 h-4 text-pink-500" />
                            {orderData.shippingInfo?.phone || orderData.user?.phone}
                        </p>
                        <p className="flex items-start gap-2 pt-1 border-t border-gray-100">
                            <MapPin className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                            <span>{orderData.address}</span>
                        </p>
                        <p className="text-xs text-gray-500 font-medium pt-1">
                            Phương thức vận chuyển: <span className="font-bold text-gray-700">{orderData.shippingMethod || 'Tiêu chuẩn'}</span>
                        </p>
                    </div>
                </div>

                {/* Thanh toán */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Phương thức thanh toán</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div>
                            <p className="text-xs text-gray-500">Hình thức</p>
                            <p className="font-bold text-gray-800 text-base">{orderData.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${paymentStatusInfo.color}`}>
                                <paymentStatusInfo.icon className="w-3.5 h-3.5" />
                                {paymentStatusInfo.label}
                            </span>
                        </div>
                        {orderData.voucherCode && (
                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Mã giảm giá</span>
                                <span className="font-mono text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded text-xs">{orderData.voucherCode}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tổng kết chi phí */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Tổng kết đơn hàng</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Tạm tính</span>
                            <span className="font-bold text-gray-800">{formatCurrency(orderData.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span className="font-bold text-gray-800">{formatCurrency(orderData.shipping)}</span>
                        </div>
                        {orderData.discount > 0 && (
                            <div className="flex justify-between text-pink-600">
                                <span>Giảm giá</span>
                                <span className="font-bold">-{formatCurrency(orderData.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-base font-extrabold text-gray-900">
                            <span>TỔNG THANH TOÁN</span>
                            <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(orderData.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-500" />
                    Sản phẩm trong đơn ({orderData.items?.length || 0})
                </h3>
                <div className="divide-y divide-gray-100">
                    {orderData.items?.map((product, index) => {
                        const unitPrice = product.price || 0;
                        const itemTotal = unitPrice * (product.quantity || 1);
                        
                        const FASHION_FALLBACKS = [
                            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80',
                            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80',
                            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80',
                            'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&q=80',
                            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80',
                        ];
                        const defaultImg = FASHION_FALLBACKS[(product.productName || '').length % FASHION_FALLBACKS.length];

                        const getImgSrc = (item) => {
                            const raw = item.mainImage || item.image || item.productImage || (Array.isArray(item.images) && item.images[0]) || item.product?.mainImage || item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]) || item.variation?.image || item.variant?.image;
                            if (!raw) return defaultImg;
                            if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
                            return raw.startsWith('/') ? raw : `/${raw}`;
                        };

                        return (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 hover:bg-pink-50/30 rounded-2xl px-3 transition-colors">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={getImgSrc(product)}
                                        alt={product.productName}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultImg;
                                        }}
                                        className="w-20 h-20 object-cover rounded-2xl border border-gray-200 shadow-sm flex-shrink-0 bg-gray-100"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900 text-base mb-1">{product.productName}</p>
                                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                                            {product.color && <span className="bg-gray-100 px-2 py-0.5 rounded-full">Màu: {product.color}</span>}
                                            {product.size && <span className="bg-gray-100 px-2 py-0.5 rounded-full">Size: {product.size}</span>}
                                            <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">SL: x{product.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-0 pt-2 sm:pt-0">
                                    <span className="text-xs text-gray-400 font-medium sm:hidden">Thành tiền:</span>
                                    <div>
                                        <p className="font-black text-pink-600 text-lg">{formatCurrency(itemTotal)}</p>
                                        <p className="text-xs text-gray-400 font-medium">({formatCurrency(unitPrice)} / sản phẩm)</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Đánh giá sản phẩm khi hoàn thành */}
            {currentStatus === "COMPLETED" && (
                <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-3xl p-6 sm:p-8 space-y-6 border border-pink-200/80 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl text-white shadow-md">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-800">Đánh giá sản phẩm</h3>
                            <p className="text-xs text-gray-500 font-medium">Hãy chia sẻ trải nghiệm sử dụng của bạn để nhận xu thưởng!</p>
                        </div>
                    </div>
                    <div className="space-y-6 pt-2">
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