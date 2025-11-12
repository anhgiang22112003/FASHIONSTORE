import React, { useEffect, useState, memo } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import apiAdmin from '@/service/apiAdmin'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Bell, Package, Star, AlertCircle, CheckCircle, X } from 'lucide-react'

const NotificationDropdown = memo(({ userId, setActiveTab, setEditingOrder, setEditingProductId, onNotificationsChange }) => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await apiAdmin.get('/notifications')
        const notificationData = res.data || []
        setNotifications(notificationData)
        
        const unreadCount = notificationData.filter(n => !n.isRead).length
        if (onNotificationsChange) {
          onNotificationsChange(unreadCount)
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error)
        toast.error('Lỗi khi lấy thông báo')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userId, onNotificationsChange])

  const handleNotificationClick = async (notification) => {
    const { link, _id, isRead } = notification
    
    if (!isRead && _id) {
      try {
        await apiAdmin.post(`/notifications/read/${_id}`)
        
        const updatedNotifications = notifications.map(n => 
          n._id === _id ? { ...n, isRead: true } : n
        )
        setNotifications(updatedNotifications)
        
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length
        if (onNotificationsChange) {
          onNotificationsChange(unreadCount)
        }
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error)
      }
    }

    if (!link || typeof link !== 'object') return
    const { tab, params } = link
    setActiveTab(tab)
    if (tab === 'edit-order' && params?.orderId) setEditingOrder(params.orderId)
    if (tab === 'edit-product' && params?.productId) setEditingProductId(params.productId)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5" />
      case 'review':
        return <Star className="w-5 h-5" />
      case 'product':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <CheckCircle className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'from-pink-500 to-rose-500'
      case 'review':
        return 'from-blue-500 to-indigo-500'
      case 'product':
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-green-500 to-emerald-500'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const totalCount = notifications.length

  return (
    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideDown">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg">
              Thông báo
            </h4>
          </div>
          {unreadCount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
              {unreadCount} mới
            </span>
          )}
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : totalCount > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((n, idx) => (
              <div
                key={n._id || idx}
                onClick={() => handleNotificationClick(n)}
                className={`px-6 py-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group ${
                  !n.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 p-2.5 bg-gradient-to-br ${getNotificationColor(n.type)} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <div className="text-white">
                      {getNotificationIcon(n.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{n.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Không có thông báo nào</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalCount > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <a href="#" className="block text-center text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors">
            Xem tất cả thông báo
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #a855f7);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #db2777, #9333ea);
        }
      `}</style>
    </div>
  )
})

NotificationDropdown.displayName = 'NotificationDropdown'

export default NotificationDropdown