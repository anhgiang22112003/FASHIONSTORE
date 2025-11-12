import React, { useMemo, useCallback } from 'react'
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import ProductReviewForm from './ProductReviewForm'

// Hàm tiện ích
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

const getStatusColor = (status) => {
    switch (status) {
        case "COMPLETED":
            return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
        case "CANCELLED":
            return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50"
        case "SHIPPED":
            return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
        case "PENDING":
        case "PROCESSING":
        default:
            return "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50"
    }
}

// Status icon component
const StatusIcon = React.memo(({ status }) => {
  const iconClass = "w-6 h-6"
  
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

// Product item component - memoized
const ProductItem = React.memo(({ item, index }) => {
  return (
    <div className="group flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-4 border-b last:border-b-0 hover:bg-gradient-to-r hover:from-pink-50 hover:to-transparent transition-all duration-300 rounded-lg">
      <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto mb-3 sm:mb-0">
        {/* Product image placeholder */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <svg className="relative w-10 h-10 text-gray-400 group-hover:text-pink-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5V9.5h2v8h-2z"></path>
          </svg>
        </div>
        
        {/* Product info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-pink-600 transition-colors duration-200">
            {item.productName}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
              {item.color}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              {item.size}
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Đơn giá: <span className="font-semibold ml-1">{item?.price?.toLocaleString()}₫</span>
          </p>
        </div>
      </div>
      
      {/* Quantity and total */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 pl-24 sm:pl-0">
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="font-bold text-lg text-pink-600">x{item.quantity}</span>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
            {(item.price * item.quantity)?.toLocaleString()}₫
          </p>
        </div>
      </div>
    </div>
  )
})

ProductItem.displayName = "ProductItem"

const OrderDetail = ({ order, onBack }) => {
    // Tính tổng số lượng sản phẩm - memoized
    const totalItems = useMemo(() => {
      return order?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    }, [order?.items])

    // Memoize product list
    const productList = useMemo(() => {
      return order?.items?.map((item, i) => (
        <ProductItem key={`${item.productName}-${i}`} item={item} index={i} />
      ))
    }, [order?.items])

    // Memoize review forms
    const reviewForms = useMemo(() => {
      if (order?.status !== "COMPLETED") return null
      return order?.items?.map((item, i) => (
        <ProductReviewForm key={`review-${i}`} item={item} userId={order?.user} orderId={order._id} />
      ))
    }, [order?.status, order?.items, order?.user, order?._id])

    return (
        <div className="max-w-[1550px] mx-auto px-4 py-8">
            {/* Back button với animation */}
            <button
                onClick={onBack}
                className="group flex items-center text-pink-600 hover:text-pink-800 transition-all duration-300 mb-6 font-medium transform hover:-translate-x-1"
            >
                <div className="w-8 h-8 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center mr-2 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </div>
                <span>Quay lại Lịch sử đơn hàng</span>
            </button>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header với gradient background */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <h1 className="text-3xl font-bold">
                                  Đơn hàng #{order?._id?.substring(0, 8).toUpperCase()}
                              </h1>
                            </div>
                            <p className="text-pink-100 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                Đặt vào:{" "}
                                {order?.createdAt
                                    ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
                                    : "Không xác định"}
                            </p>
                        </div>
                        <span className={`inline-flex items-center space-x-2 text-sm font-bold px-5 py-3 rounded-xl ${getStatusColor(order.status)} transform hover:scale-105 transition-transform duration-200`}>
                            <StatusIcon status={order.status} />
                            <span>{getStatusVietnamese(order.status)}</span>
                        </span>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Thông tin đơn hàng và giao hàng */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cột 1 & 2: Địa chỉ & Thanh toán */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Thông tin giao hàng */}
                            <div className="bg-gradient-to-br from-gray-50 to-pink-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <h2 className="text-xl font-bold text-gray-800">Thông tin giao hàng</h2>
                                </div>
                                <div className="space-y-3 text-gray-700">
                                    <div className="flex items-start space-x-3">
                                      <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <p className="text-sm text-gray-500">Người nhận</p>
                                        <p className="font-semibold">{order.recipientName || 'Khách hàng'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                      <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                      </svg>
                                      <div>
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <p className="font-semibold">{order.phone || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                      <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                                        <p className="font-semibold">{order.address}</p>
                                      </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thanh toán */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <h2 className="text-xl font-bold text-gray-800">Thanh toán</h2>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Phương thức:</span>
                                    <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {order.paymentStatus === 'PAID' ? (
                                        <>
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          Đã thanh toán
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                          </svg>
                                          Chờ thanh toán
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột 3: Tóm tắt */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl shadow-lg border border-pink-100 sticky top-4">
                                <div className="flex items-center space-x-3 mb-6">
                                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <h2 className="text-xl font-bold text-pink-800">Tóm tắt đơn hàng</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-gray-700">
                                        <span className="flex items-center">
                                          <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                          </svg>
                                          Tổng tiền hàng
                                        </span>
                                        <span className="font-semibold">{order?.subtotal?.toLocaleString()}₫</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span className="flex items-center">
                                          <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                          </svg>
                                          Số lượng
                                        </span>
                                        <span className="font-medium">{totalItems} món</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700">
                                        <span className="flex items-center">
                                          <svg className="w-4 h-4 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                          </svg>
                                          Phí vận chuyển
                                        </span>
                                        <span className="font-semibold">{order?.shippingFee?.toLocaleString()}₫</span>
                                    </div>
                                    <div className="border-t-2 border-pink-200 pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-800">Thành tiền:</span>
                                            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                                              {order?.total?.toLocaleString()}₫
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="bg-gradient-to-br from-gray-50 to-transparent p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</h2>
                        </div>
                        <div className="space-y-1">
                            {productList}
                        </div>
                    </div>

                    {/* Đánh giá sản phẩm */}
                    {order?.status === "COMPLETED" && (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">Đánh giá sản phẩm</h2>
                            </div>
                            <div className="space-y-4">
                                {reviewForms}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderDetail