import React, { useEffect, useState, useCallback, useMemo } from "react"
import api from "@/service/api"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import OrderDetail from "./OrderDetail"

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
      return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
    case "CANCELLED":
      return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200"
    case "SHIPPED":
      return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
    case "PENDING":
    case "PROCESSING":
    default:
      return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200"
  }
}

// Status icon component
const StatusIcon = React.memo(({ status }) => {
  const iconClass = "w-5 h-5"
  
  switch (status) {
    case "COMPLETED":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    case "CANCELLED":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    case "SHIPPED":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      )
    default:
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
  }
})

StatusIcon.displayName = "StatusIcon"

// Skeleton loader component
const OrderSkeleton = React.memo(() => (
  <div className="grid grid-cols-5 gap-4 items-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm animate-pulse">
    <div className="col-span-2 md:col-span-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-100 rounded w-full hidden md:block"></div>
    </div>
    <div className="col-span-3 md:col-span-2 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="col-span-2 md:col-span-1">
      <div className="h-7 bg-gray-200 rounded-full w-full"></div>
    </div>
    <div className="col-span-1 text-right">
      <div className="h-6 w-6 bg-gray-200 rounded ml-auto"></div>
    </div>
  </div>
))

OrderSkeleton.displayName = "OrderSkeleton"

// Order card component - memoized để tránh re-render
const OrderCard = React.memo(({ order, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group grid grid-cols-5 md:grid-cols-5 gap-4 items-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Cột 1: Mã đơn hàng */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-pink-600 truncate text-sm">#{order._id.substring(0, 8).toUpperCase()}</p>
            <p className="text-xs text-gray-400 truncate hidden md:block">{order._id}</p>
          </div>
        </div>
      </div>

      {/* Cột 2 & 3: Ngày đặt & Tổng tiền */}
      <div className="col-span-3 md:col-span-2 space-y-1">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="truncate">
            {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          </span>
        </div>
        <p className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
          {order.total.toLocaleString()}₫
        </p>
      </div>

      {/* Cột 4: Trạng thái */}
      <div className="col-span-2 md:col-span-1">
        <span
          className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-full border ${getStatusColor(order.status)} transition-all duration-200`}
        >
          <StatusIcon status={order.status} />
          <span className="truncate">{getStatusVietnamese(order.status)}</span>
        </span>
      </div>

      {/* Cột 5: Icon xem chi tiết */}
      <div className="col-span-1 text-right">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-pink-100 transition-colors duration-200">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
})

OrderCard.displayName = "OrderCard"

// Empty state component
const EmptyState = React.memo(() => (
  <div className="text-center py-20 bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg m-4 border border-pink-100">
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 bg-pink-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
      <svg className="relative w-20 h-20 mx-auto text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
    <p className="text-gray-500 mb-6">Hãy bắt đầu mua sắm để xem lịch sử tại đây!</p>
    <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
      Khám phá sản phẩm
    </button>
  </div>
))

EmptyState.displayName = "EmptyState"

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders/detail")
      setOrders(res.data)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể tải đơn hàng")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOrderClick = useCallback((order) => {
    setSelectedOrder(order)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedOrder(null)
  }, [])

  // Memoize order list để tránh re-render không cần thiết
  const orderList = useMemo(() => {
    return orders.map((order) => (
      <OrderCard
        key={order._id}
        order={order}
        onClick={() => handleOrderClick(order)}
      />
    ))
  }, [orders, handleOrderClick])

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={handleBack} />
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-12 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="max-w-[1550px] mx-auto px-4 py-8">
      {/* Header với gradient */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 mb-2">
          Lịch sử đơn hàng
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
      </div>

      {/* Header cho danh sách - chỉ hiện trên desktop */}
      <div className="hidden md:grid grid-cols-5 gap-4 py-4 px-6 bg-gradient-to-r from-gray-50 to-pink-50 text-gray-600 font-semibold text-sm rounded-xl mb-4 border border-gray-100">
        <span className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span>Mã đơn hàng</span>
        </span>
        <span className="col-span-2 flex items-center space-x-2">
          <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>Thông tin đơn hàng</span>
        </span>
        <span className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Trạng thái</span>
        </span>
        <span className="text-right">Chi tiết</span>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="space-y-3">
        {orderList}
      </div>
    </div>
  )
}

export default OrderHistory