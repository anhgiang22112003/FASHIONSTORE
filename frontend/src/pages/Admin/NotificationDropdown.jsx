import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import apiAdmin from '@/service/apiAdmin'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const NotificationDropdown = ({ userId, setActiveTab, setEditingOrder, setEditingProductId, onNotificationsChange }) => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiAdmin.get('/notifications')
        const notificationData = res.data || []
        setNotifications(notificationData)
        
        // Gửi số thông báo chưa đọc lên Header
        const unreadCount = notificationData.filter(n => !n.isRead).length
        if (onNotificationsChange) {
          onNotificationsChange(unreadCount)
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error)
        toast.error('Lỗi khi lấy thông báo')
      }
    }
    fetchData()
  }, [userId, onNotificationsChange])

  const handleNotificationClick = async (notification) => {
    const { link, _id, isRead } = notification
    
    // Đánh dấu đã đọc nếu chưa đọc
    if (!isRead && _id) {
      try {
        await apiAdmin.post(`/notifications/read/${_id}`)
        
        // Cập nhật state local
        const updatedNotifications = notifications.map(n => 
          n._id === _id ? { ...n, isRead: true } : n
        )
        setNotifications(updatedNotifications)
        
        // Cập nhật số lượng thông báo chưa đọc
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length
        if (onNotificationsChange) {
          onNotificationsChange(unreadCount)
        }
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error)
      }
    }

    // Xử lý navigation
    if (!link || typeof link !== 'object') return
    const { tab, params } = link
    setActiveTab(tab)
    if (tab === 'edit-order' && params?.orderId) setEditingOrder(params.orderId)
    if (tab === 'edit-product' && params?.productId) setEditingProductId(params.productId)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const totalCount = notifications.length

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">
          Thông báo 
        </h4>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount} mới
          </span>
        )}
      </div>

      {/* Danh sách thông báo */}
      <div className="max-h-60 overflow-y-auto">
        {totalCount > 0 ? (
          notifications.map((n, idx) => (
            <div
              key={n._id || idx}
              onClick={() => handleNotificationClick(n)}
              className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 ${
                !n.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      n.type === 'order'
                        ? 'text-pink-600'
                        : n.type === 'product'
                        ? 'text-yellow-600'
                        : n.type === 'review'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                </div>
                {!n.isRead && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            Không có thông báo nào
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 text-center">
        <a href="#" className="text-sm font-medium text-pink-600 hover:underline">
          Xem tất cả
        </a>
      </div>
    </div>
  )
}

export default NotificationDropdown