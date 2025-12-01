import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import apiAdmin from "@/service/apiAdmin"
import { QRCodeCanvas } from "qrcode.react"
import io from "socket.io-client"
import { socket } from "@/service/socket"


const BankPaymentPos = ({ order, onClose, selectedBank, setSelectedBank }) => {

    const [banks, setBanks] = useState([])
    const [isPaid, setIsPaid] = useState(false)
    const [loading, setLoading] = useState(false) // Thêm state loading cho button
    console.log(order)

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await apiAdmin.get("bank")
                const activeBanks = response.data.filter(b => b.status === true)
                setBanks(activeBanks)
            } catch (err) {
                toast.error("Không tải được danh sách ngân hàng")
            }
        }
        fetchBanks()
    }, [])

    const handleBank = (bank) => {
        // ✅ Gửi sự kiện để màn hình khách hàng hiển thị QR
        socket.emit('customer_checkout', {
            paymentMethod: order.paymentMethod,
            total: order.total,
            orderId: order._id, // Quan trọng: Gửi orderId để màn hình KH hiển thị đúng nội dung QR
            selectedBank: bank // Quan trọng: Gửi bank info để màn hình KH hiển thị QR code của bank đã chọn
        })
        setSelectedBank(bank)
    }

    // ⭐ HÀM XỬ LÝ THANH TOÁN THÀNH CÔNG (MANUAL CONFIRM)
    const handlePaymentSuccess = async () => {
        if (!order || !order._id) return toast.error("Không tìm thấy ID đơn hàng")
        setLoading(true)
        try {
            // Gọi API giả định để cập nhật trạng thái đơn hàng (Backend)
            await apiAdmin.post(`pos/order/pos-payment-status/${order._id}`, {
                status: 'COMPLETED', // Trạng thái thành công
                paymentStatus: 'APPROVED',
            })
            
            // Xử lý thành công trên Frontend
            setIsPaid(true)
            toast.success("Xác nhận thanh toán thành công!")
            // Đóng modal sau 1.5

        } catch (error) {
            toast.error("Xác nhận thanh toán thất bại. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    // ⭐ HÀM XỬ LÝ THANH TOÁN LỖI (MANUAL FAIL)
    const handlePaymentFailed = async () => {
        if (!order || !order._id) return toast.error("Không tìm thấy ID đơn hàng")
        setLoading(true)
        try {
            // Gọi API giả định để cập nhật trạng thái đơn hàng (Backend)
            await apiAdmin.post(`pos/order/pos-payment-status/${order._id}`, {
                status: 'CANCELLED',
                paymentStatus: 'FAILED',
            })

            // Xử lý lỗi trên Frontend
            toast.warn("Đơn hàng đã được đánh dấu là LỖI thanh toán.")
            setTimeout(() => {
                onClose()
            }, 1500)

        } catch (error) {
            toast.error("Xác nhận trạng thái lỗi thất bại. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"))
        if (!user?.id) return
        socket.emit("join_user", user.id)
        
        // Lắng nghe xác nhận thanh toán từ Webhook/Backend
        socket.on("user_payment_success", (data) => {
            console.log("Received:", data)
            if (data.order._id === order._id) {
                setIsPaid(true)
                toast.success("Thanh toán tự động thành công qua ngân hàng!")
                // Không cần chuyển hướng, để hàm handlePaymentSuccess làm việc đó
                // setTimeout(() => window.location.href = "/orders", 1000) 
            }
        })

        return () => {
            socket.off("user_payment_success")
        }
    }, [order?._id]) // Thêm order._id vào dependency

    const defaultAccount = {
        name: "Nguyễn Hồng Giang",
        number: "0343887327",
    }
    // QR data cần dùng thông tin từ selectedBank và Order ID
    const bankCode = selectedBank?.code || "MBBANK" 
    const accountNumber = selectedBank?.accountNumber || "1880115012003"
    const info = `don+hang+${order._id}` // Đảm bảo order._id có giá trị
    const qrData = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?addInfo=${info}&amount=${order.total}`
    console.log(qrData)

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] relative">
                <h2 className="text-xl font-bold mb-3">Thanh toán qua ngân hàng</h2>

                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>

                {/* Danh sách ngân hàng */}
                {!selectedBank && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
                        {banks.map(bank => (
                            <div
                                key={bank._id}
                                // ✅ Sửa lỗi: Bọc trong hàm mũi tên
                                onClick={() => handleBank(bank)}
                                className={`p-3 border rounded-lg cursor-pointer ${selectedBank?._id === bank._id ? "border-pink-500 bg-pink-50" : "hover:bg-gray-100"}`}
                            >
                                <div className="font-semibold">{bank.name}</div>
                                <div className="text-sm text-gray-600">{bank.description}</div>
                            </div>
                        ))}
                    </div>
                )}
                

                {/* QR code */}
                {selectedBank && (
                    <div className="flex flex-col items-center">
                        <img src={qrData} alt="QR Code Thanh Toán" className="max-w-xs h-auto border p-2 rounded-lg" />
                        <p className="mt-2 text-sm text-gray-600 text-left w-full max-w-xs">
                            <b>Ngân hàng:</b> {selectedBank.name} <br />
                            <b>Chủ TK:</b> {selectedBank.accountName || defaultAccount.name} <br />
                            <b>STK:</b> {selectedBank.accountNumber || defaultAccount.number} <br />
                            <b>Nội dung:</b> don hang {order._id}
                        </p>

                        {!isPaid ? (
                            <div className="mt-4 flex flex-col items-center space-y-3">
                                <div className="flex items-center space-x-2 text-pink-600 font-medium">
                                    <span>Đang chờ thanh toán tự động...</span>
                                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                
                                {/* ⭐ BUTTONS XÁC NHẬN THỦ CÔNG */}
                                <div className="flex space-x-3 mt-4">
                                    <button 
                                        onClick={handlePaymentSuccess}
                                        disabled={loading}
                                        className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400"
                                    >
                                        {loading ? "Đang xử lý..." : "✅ Xác nhận Thành công"}
                                    </button>
                                    <button 
                                        onClick={handlePaymentFailed}
                                        disabled={loading}
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-gray-400"
                                    >
                                        {loading ? "Đang xử lý..." : "❌ Báo lỗi"}
                                    </button>
                                </div>
                                {/* END BUTTONS */}

                            </div>
                        ) : (
                            <p className="mt-5 text-green-600 font-bold text-lg">✅ Thanh toán thành công</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BankPaymentPos