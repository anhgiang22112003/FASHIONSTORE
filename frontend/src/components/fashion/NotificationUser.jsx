import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import apiAdmin from '@/service/apiAdmin'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const NotificationDropdown = ({ userId ,setActiveTab,setEditingOrder,setEditingProductId}) => {
  const [notifications, setNotifications] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiAdmin.get(`/notifications`)
        setNotifications(res.data)
       
      } catch (error) {
        toast.error('Lỗi khi lấy thông báo:', error)
      }
    }
    fetchData()
  }, [userId])
  console.log(notifications);
  
const handleNotificationClick = (link) => {
  console.log('Click link:', link)
  if (!link || typeof link !== 'object') return
  const { tab, params } = link
  setActiveTab(tab)
  if (tab === 'edit-order' && params?.orderId) setEditingOrder(params.orderId)
  if (tab === 'edit-product' && params?.productId) setEditingProductId(params.productId)


}


  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">
          Thông báo ({notifications.length})
        </h4>
      </div>

      {/* Danh sách thông báo */}
      <div className="max-h-60 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n, idx) => (
            <div
              key={idx}
              className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
              
            >
              <div
                key={idx}
               onClick={() => handleNotificationClick(n.link)}
                className="block px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
              >
              <p
                className={`text-sm font-medium ${n.type === 'order'
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
        <a
          href="#"
          className="text-sm font-medium text-pink-600 hover:underline"
        >
          Xem tất cả
        </a>
      </div>
    </div>
  )
}
export default NotificationDropdown
