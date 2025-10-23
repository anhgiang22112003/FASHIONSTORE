import React, { useEffect, useState } from "react"
import api from "@/service/api"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import OrderDetail from "./OrderDetail" // Import component chi tiết
import { socket } from "@/service/socket"

// Hàm tiện ích để chuyển đổi trạng thái thành tiếng Việt
const getStatusVietnamese = (status) => {
  switch (status) {
    case "PENDING":
      return "Đang chờ xử lý"
    case "PROCESSING":
      return "Đang đóng gói"
    case "SHIPPED":
      return "Đang vận chuyển"
    case "COMPLETED":
      return "Đã giao hàng"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status
  }
}

// Hàm tiện ích để lấy màu cho trạng thái
const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200"
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200"
    case "SHIPPED":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "PENDING":
    case "PROCESSING":
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
  }
}

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null) // State để lưu đơn hàng được chọn
  const currentUser = JSON.parse(localStorage.getItem("user"))
  useEffect(() => {
    socket.on("orderStatusUpdated", (order) => {
      if (order.user === currentUser?.id) {
        fetchOrders()
        toast.info(`Trạng thái đơn #${order._id} đã đổi thành ${order.status}`)
      }
    })

    return () => socket.off("orderStatusUpdated")
  }, [])
  const fetchOrders = async () => {
    try {
      // Giả định API trả về danh sách đơn hàng của người dùng hiện tại
      const res = await api.get("/orders/detail")
      setOrders(res.data)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể tải đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
  }

  // Nếu có đơn hàng được chọn, hiển thị OrderDetail
  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
  }

  if (loading) return <p className="text-center py-10 text-xl font-medium text-pink-600">Đang tải lịch sử đơn hàng...</p>

  if (orders.length === 0)
    return (
      <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg m-4">
        <svg className="w-16 h-16 mx-auto mb-4 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-9 0V3h4v2m-4 0h4m-4 0v2"></path></svg>
        <p className="text-xl font-medium">Bạn chưa có đơn hàng nào.</p>
        <p className="text-sm">Hãy bắt đầu mua sắm để xem lịch sử tại đây!</p>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b pb-4">Lịch sử đơn hàng</h1>

      <div className="space-y-4">
        {/* Header cho danh sách đơn hàng (chỉ để tham khảo giao diện) */}
        <div className="hidden md:grid grid-cols-5 gap-4 py-3 px-6 bg-gray-50 text-gray-500 font-semibold text-sm rounded-lg">
          <span>Mã đơn hàng</span>
          <span className="col-span-2">Ngày đặt & Tổng tiền</span>
          <span>Trạng thái</span>
          <span className="text-right">Xem chi tiết</span>
        </div>

        {orders.map((order) => (
          <div
            key={order._id}
            onClick={() => handleOrderClick(order)} // Thêm sự kiện click
            className="grid grid-cols-5 md:grid-cols-5 gap-4 items-center p-5 bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            {/* Cột 1: Mã đơn hàng (ID) */}
            <div className="col-span-2 md:col-span-1">
              <p className="font-bold text-pink-600 truncate">#{order._id.substring(0, 8).toUpperCase()}</p>
              <p className="text-xs text-gray-400 hidden md:block">{order._id}</p>
            </div>

            {/* Cột 2 & 3: Ngày đặt & Tổng tiền */}
            <div className="col-span-3 md:col-span-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold block md:inline">Ngày đặt: </span>
                {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </p>
              <p className="font-extrabold text-xl text-gray-900">
                {order.total.toLocaleString()}₫
              </p>
            </div>

            {/* Cột 4: Trạng thái */}
            <div className="col-span-2 md:col-span-1">
              <span
                className={`text-sm font-medium px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}
              >
                {getStatusVietnamese(order.status)}
              </span>
            </div>

            {/* Cột 5: Nút Xem chi tiết (Chỉ hiện icon) */}
            <div className="col-span-1 text-right">
              <button className="text-gray-400 hover:text-pink-600 transition-colors hidden md:inline-block" title="Xem chi tiết">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderHistory