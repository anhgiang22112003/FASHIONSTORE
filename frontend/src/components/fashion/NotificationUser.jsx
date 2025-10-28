import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'

const NotificationUser = ({
  userId,
  setActiveTab,
  setEditingOrder,
  setEditingProductId,
  onNotificationsChange, // ⚡ callback để cập nhật badge ở header
}) => {
  const [notifications, setNotifications] = useState([])

  // ✅ Lấy danh sách thông báo khi userId thay đổi
  useEffect(() => {
    if (!userId) return
    const fetchNotifications = async () => {
      try {
        const res = await apiAdmin.get(`/notifications/user/${userId}`)
        const data = res.data || []
        setNotifications(data)

        // Cập nhật số lượng chưa đọc lên Header
        const unreadCount = data.filter((n) => !n.isRead).length
        onNotificationsChange?.(unreadCount)
      } catch (err) {
        console.error('Lỗi khi tải thông báo:', err)
        toast.error('Không thể tải danh sách thông báo')
      }
    }
    fetchNotifications()
  }, [userId, onNotificationsChange])

  // ✅ Click thông báo: đánh dấu đã đọc + xử lý điều hướng
  const handleNotificationClick = async (notification) => {
    const { _id, link, isRead } = notification

    // Nếu chưa đọc thì đánh dấu đã đọc
    if (!isRead && _id) {
      try {
        await apiAdmin.post(`/notifications/read/${_id}`)

        const updated = notifications.map((n) =>
          n._id === _id ? { ...n, isRead: true } : n
        )
        setNotifications(updated)

        // Cập nhật số lượng chưa đọc
        const unreadCount = updated.filter((n) => !n.isRead).length
        onNotificationsChange?.(unreadCount)
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error)
      }
    }

    // ✅ Điều hướng khi click vào
    if (typeof link === 'object' && link.tab) {
      setActiveTab?.(link.tab)
      if (link.params?.orderId) setEditingOrder?.(link.params.orderId)
      if (link.params?.productId) setEditingProductId?.(link.params.productId)
    } else if (typeof link === 'string') {
      window.location.href = link
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const totalCount = notifications.length

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">Thông báo</h4>
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

export default NotificationUser
