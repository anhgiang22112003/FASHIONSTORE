import React from 'react';

// Dữ liệu đơn hàng giả lập để hiển thị
const orderData = {
    id: "PF0001",
    status: "Đang giao",
    orderDate: "10/10/2023, 10:00",
    deliveryHistory: [
        { status: "Đã tiếp nhận", time: "10/10/2023, 10:05" },
        { status: "Đã lấy hàng", time: "10/10/2023, 10:30" },
        { status: "Đang xử lý tại kho", time: "10/10/2023, 11:45" },
        { status: "Đang giao", time: "10/10/2023, 14:00" },
    ],
    shippingInfo: {
        name: "Nguyễn Thị Mai",
        phone: "0912 345 678",
        address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
        shippingMethod: "Giao hàng tiêu chuẩn",
    },
    buyerInfo: {
        name: "Nguyễn Thị Lan",
        phone: "0909 876 543",
        address: "456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    },
    paymentSummary: {
        subtotal: 1200000,
        shippingFee: 30000,
        discount: 0,
        total: 1230000,
        paymentMethod: "Thanh toán khi nhận hàng (COD)",
    },
    products: [
        { name: "Váy hoa vintage", quantity: 1, price: 900000, image: "https://placehold.co/100x100/f0d1de/ffffff?text=Váy" },
        { name: "Áo sơ mi thanh lịch", quantity: 1, price: 300000, image: "https://placehold.co/100x100/f0d1de/ffffff?text=Áo" }
    ],
    notes: "Khách hàng yêu cầu gói quà.",
};

const OrderDetails = () => {
    // Hàm format tiền tệ
    const formatCurrency = (amount) => {
        return `${amount.toLocaleString('vi-VN')}₫`;
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans antialiased ">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-8">
                {/* Header và trạng thái */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
                        <p className="text-gray-500">Mã đơn hàng: #{orderData.id}</p>
                    </div>
                    <span className="px-4 py-1 rounded-full font-semibold text-sm"
                        style={{ backgroundColor: '#fff3cd', color: '#ff6900' }}>
                        {orderData.status}
                    </span>
                </div>

                {/* Nội dung chính 3 cột */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Cột 1: Timeline lịch sử giao hàng */}
                    <div className="bg-pink-50 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Tình trạng đơn hàng</h3>
                        <div className="relative border-l-2 border-pink-300 pl-6 space-y-8">
                            {orderData.deliveryHistory.map((step, index) => (
                                <div key={index} className="relative">
                                    <span className={`absolute -left-3 top-0 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 ${step.status === orderData.status ? 'border-pink-500 bg-pink-500' : 'border-pink-300 bg-white'}`}></span>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-gray-800">{step.status}</p>
                                        <p className="text-sm text-gray-500">{step.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột 2: Thông tin giao hàng và người mua/bán */}
                    <div className="space-y-8">
                        {/* Thông tin giao hàng */}
                        <div className="bg-pink-50 rounded-2xl p-6 space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800">Thông tin giao hàng</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium text-gray-600">Người nhận:</span> {orderData.shippingInfo.name}</p>
                                <p><span className="font-medium text-gray-600">Điện thoại:</span> {orderData.shippingInfo.phone}</p>
                                <p><span className="font-medium text-gray-600">Địa chỉ:</span> {orderData.shippingInfo.address}</p>
                            </div>
                        </div>
                        {/* Thông tin người mua */}
                        <div className="bg-pink-50 rounded-2xl p-6 space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800">Thông tin người mua</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium text-gray-600">Người mua:</span> {orderData.buyerInfo.name}</p>
                                <p><span className="font-medium text-gray-600">Điện thoại:</span> {orderData.buyerInfo.phone}</p>
                                <p><span className="font-medium text-gray-600">Địa chỉ:</span> {orderData.buyerInfo.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cột 3: Tổng kết thanh toán */}
                    <div className="bg-pink-50 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Tổng kết thanh toán</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <p className="text-gray-600">Tạm tính:</p>
                                <p className="font-medium text-gray-800">{formatCurrency(orderData.paymentSummary.subtotal)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">Phí vận chuyển:</p>
                                <p className="font-medium text-gray-800">{formatCurrency(orderData.paymentSummary.shippingFee)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-gray-600">Giảm giá:</p>
                                <p className="font-medium text-red-500">{formatCurrency(orderData.paymentSummary.discount)}</p>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                                <p className="text-gray-800">Tổng cộng:</p>
                                <p className="text-pink-600">{formatCurrency(orderData.paymentSummary.total)}</p>
                            </div>
                            <p className="text-gray-500 text-xs text-right mt-2">Hình thức thanh toán: {orderData.paymentSummary.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                {/* Chi tiết sản phẩm */}
                   <div className="bg-white rounded-2xl p-6 space-y-4 shadow-md">
                <h4 className="text-xl font-semibold text-gray-800">Chi tiết sản phẩm</h4>
                <div className="space-y-4">
                    {orderData.products.map((product, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-pink-50" />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">Size: {product.size}, Màu: {product.color}</p>
                                <p className="text-sm text-gray-500">Số lượng: {product.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-pink-600">{formatCurrency(product.price)}</p>
                                <p className="text-sm text-gray-500">{formatCurrency(product.price / product.quantity)} /cái</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Thông tin đơn hàng */}
            <div className="bg-white rounded-2xl p-6 space-y-4 shadow-md">
                <h4 className="text-xl font-semibold text-gray-800">Thông tin đơn hàng</h4>
                <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                        <p>Ngày đặt hàng</p>
                        <p>{orderData.orderDate}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>Mã khuyến mãi</p>
                        <p className="font-semibold text-green-500">{orderData.discountCode}</p>
                    </div>
                    <div>
                        <p>Ghi chú đặc biệt</p>
                        <p className="pl-4 italic text-gray-500">{orderData.specialNote}</p>
                    </div>
                </div>
            </div>

            {/* Cần hỗ trợ */}
            <div className="bg-pink-50 rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c0-3.379 2.91-6.126 6.5-6.126 3.59 0 6.5 2.747 6.5 6.126 0 3.38-2.91 6.126-6.5 6.126-3.59 0-6.5-2.747-6.5-6.126zM20.228 17.026c0-3.379 2.91-6.126 6.5-6.126 3.59 0 6.5 2.747 6.5 6.126 0 3.38-2.91 6.126-6.5 6.126-3.59 0-6.5-2.747-6.5-6.126zM4 12c0-3.379 2.91-6.126 6.5-6.126 3.59 0 6.5 2.747 6.5 6.126 0 3.38-2.91 6.126-6.5 6.126-3.59 0-6.5-2.747-6.5-6.126z" /></svg>
                <div>
                    <p className="font-semibold text-gray-800">Cần hỗ trợ?</p>
                    <p className="text-sm text-gray-600">Liên hệ: <a href="tel:19001234" className="text-pink-500 underline">1900-1234</a> hoặc <a href="mailto:support@pinkfashion.com" className="text-pink-500 underline">support@pinkfashion.com</a></p>
                </div>
            </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors">
                        Cập nhật
                    </button>
                    <button className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors">
                        Hoàn tác
                    </button>
                    <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                        Giao hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;