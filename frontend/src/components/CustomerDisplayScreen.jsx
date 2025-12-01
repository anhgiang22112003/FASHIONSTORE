import React, { useEffect, useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import io from 'socket.io-client'

const CustomerDisplayScreen = () => {
    const [cart, setCart] = useState(null)
    const [showPayment, setShowPayment] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState(null)
    const [selectedBankInfo, setSelectedBankInfo] = useState(null)
    const socketRef = useRef(null)

    useEffect(() => {
        // Tạo socket connection chỉ một lần
        const URL =
            process.env.NODE_ENV === "development"
                ? "http://localhost:4000"
                : "https://backend-fashion-r76p.onrender.com"
        if (!socketRef.current) {
            const newSocket = io(URL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            })

            socketRef.current = newSocket

            newSocket.on('connect', () => {
                console.log('Customer display connected:', newSocket.id)
            })

            newSocket.on('disconnect', () => {
                console.log('Customer display disconnected')
            })

            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error)
            })

            // Lắng nghe cập nhật giỏ hàng
            newSocket.on('customer_cart_update', (data) => {
                console.log('Cart updated:', data)
                setCart(data)

                // Nếu cart là null, reset màn hình
                if (!data) {
                    setShowPayment(false)
                    setPaymentMethod(null)
                }
            })

            // Lắng nghe khi checkout với phương thức thanh toán
            newSocket.on('customer_checkout', (data) => {
                console.log('Checkout:', data)
                setPaymentMethod(data.paymentMethod)
                setSelectedBankInfo(data.selectedBank)
                setShowPayment(true)
            })

            // Lắng nghe thanh toán thành công
            newSocket.on('user_payment_success', (data) => {
                console.log('Payment success:', data)
                // Hiển thị thông báo thành công
                setTimeout(() => {
                    setCart(null)
                    setShowPayment(false)
                    setPaymentMethod(null)
                }, 3000)
            })

            // Lắng nghe admin xác nhận thanh toán
            newSocket.on('admin_payment_success', (data) => {
                console.log('Admin confirmed payment:', data)
                setTimeout(() => {
                    setCart(null)
                    setShowPayment(false)
                    setPaymentMethod(null)
                }, 3000)
            })
        }

        // Cleanup function - chỉ disconnect khi component unmount hoàn toàn
        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection')
                socketRef.current.off('connect')
                socketRef.current.off('disconnect')
                socketRef.current.off('connect_error')
                socketRef.current.off('customer_cart_update')
                socketRef.current.off('customer_checkout')
                socketRef.current.off('user_payment_success')
                socketRef.current.off('admin_payment_success')
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, []) // Empty dependency array - chỉ chạy một lần

    // Màn hình chờ
    if (!cart) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Chào mừng quý khách!</h1>
                    <p className="text-xl text-gray-600">Vui lòng chờ nhân viên thêm sản phẩm vào giỏ hàng</p>
                </div>
            </div>
        )
    }

    const subtotal = cart.subtotal || 0
    const manualDiscount = cart.manualDiscount || 0
    const voucherDiscount = cart.voucherDiscount || 0
    const total = cart.total || 0

    // Màn hình thanh toán
    if (showPayment && paymentMethod === 'BANK') {
        const bankCode = selectedBankInfo?.code || "MBBANK" // Thay MBBANK bằng code thực tế
        const accountNumber = selectedBankInfo?.accountNumber || "1880115012003"
        const accountName = selectedBankInfo?.accountName || "NGUYEN HONG GIANG" // Dùng cho phần hiển thị chữ

        // Tạo nội dung chuyển khoản động
        const info = `don+hang+${cart.orderId || 'POS'}` // Sử dụng order ID nếu có
        const qrData = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?addInfo=${info}&amount=${total}`
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán chuyển khoản</h2>
                        <p className="text-3xl font-bold text-green-600">{total.toLocaleString()} ₫</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <img src={qrData} alt="QR Code" className="w-full rounded-lg" />
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                        <div className="flex justify-between">
                            <span>Ngân hàng:</span>
                            <span className="font-semibold">{selectedBankInfo?.name || 'MB Bank'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Số tài khoản:</span>
                            <span className="font-semibold">{accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Chủ tài khoản:</span>
                            <span className="font-semibold">{accountName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Nội dung:</span>
                            <span className="font-semibold">don hang POS</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Đang chờ thanh toán...</span>
                    </div>
                </div>
            </div>
        )
    }

    // Màn hình giỏ hàng
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
                    <h1 className="text-4xl font-bold mb-2">Giỏ hàng của bạn</h1>
                    <p className="text-pink-100 text-lg">
                        {cart.items?.length || 0} sản phẩm
                    </p>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {cart.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.mainImage ? (
                                        <img src={item.mainImage} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-lg truncate">{item.productName}</h3>
                                    {(item.color || item.size) && (
                                        <p className="text-sm text-gray-500">
                                            {item.color && <span>Màu: {item.color}</span>}
                                            {item.color && item.size && <span> • </span>}
                                            {item.size && <span>Size: {item.size}</span>}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">SL: {item.quantity}</p>
                                    <p className="font-bold text-pink-600 text-lg">{(item.price * item.quantity).toLocaleString()} ₫</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tổng tiền */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Chi tiết thanh toán</h2>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span className="font-semibold text-gray-800">{subtotal.toLocaleString()} ₫</span>
                        </div>

                        {manualDiscount > 0 && (
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-600">Giảm giá:</span>
                                <span className="font-semibold text-green-600">-{manualDiscount.toLocaleString()} ₫</span>
                            </div>
                        )}

                        {voucherDiscount > 0 && (
                            <div className="flex justify-between text-lg items-center">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    Voucher:
                                </span>
                                <span className="font-semibold text-orange-600">-{voucherDiscount.toLocaleString()} ₫</span>
                            </div>
                        )}

                        {cart.voucherCode && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-sm text-orange-700 font-medium">
                                    Mã voucher: <span className="font-bold">{cart.voucherCode}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t-2 border-gray-200 pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-800">Tổng cộng:</span>
                            <span className="text-4xl font-bold text-pink-600">{total.toLocaleString()} ₫</span>
                        </div>
                    </div>

                    {paymentMethod && (
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-blue-800 font-medium text-center">
                                Phương thức thanh toán: <span className="font-bold">{paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500">
                    <p className="text-sm">Cảm ơn quý khách đã mua hàng!</p>
                </div>
            </div>
        </div>
    )
}

export default CustomerDisplayScreen