import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useLocation } from "react-router-dom"
import api from "@/service/api"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarDays, Package, CheckCircle2, XCircle, Truck, Clock3, ArrowRight, ShoppingBag } from 'lucide-react'
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
      return <CheckCircle2 className={iconClass} />
    case "CANCELLED":
      return <XCircle className={iconClass} />
    case "SHIPPED":
      return <Truck className={iconClass} />
    default:
      return <Clock3 className={iconClass} />
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
            <Package className="w-5 h-5 text-pink-600" />
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
          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors duration-200 transform group-hover:translate-x-1" />
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
      <ShoppingBag className="relative w-20 h-20 mx-auto text-pink-400" strokeWidth={1.5} />
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
  const location = useLocation()
  const highlightOrderId = location.state?.highlightOrderId
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

  useEffect(() => {
    if (!loading && highlightOrderId && orders.length > 0) {
      const match = orders.find(o => o._id === highlightOrderId)
      if (match) {
        setSelectedOrder(match)
      }
    }
  }, [loading, highlightOrderId, orders])

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
          <Package className="w-4 h-4 text-pink-500" />
          <span>Mã đơn hàng</span>
        </span>
        <span className="col-span-2 flex items-center space-x-2">
          <CalendarDays className="w-4 h-4 text-pink-500" />
          <span>Thông tin đơn hàng</span>
        </span>
        <span className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-pink-500" />
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