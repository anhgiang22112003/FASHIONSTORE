import React, { useState, useEffect } from 'react'
import {
  BellIcon,
  Bars3Icon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  TicketIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import {
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/solid'
import NotificationDropdown from 'pages/Admin/NotificationDropdown'
import apiAdmin from 'service/apiAdmin'
import SwitchAdminHeader from '../ui/switchAdminHeader'

const Header = ({ toggleSidebar, setActiveTab, setEditingProductId, setEditingOrder }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMessagesOpen, setIsMessagesOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const userId = JSON.parse(sessionStorage.getItem('user'))

  const [stats, setStats] = useState({
    pendingOrders: 0,
    revenue: 0,
    newCustomers: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiAdmin.get("/auth/stats/quick")
        setStats(res.data)
      } catch (err) {
        console.error("Failed to load quick stats", err)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await apiAdmin.get('/notifications')
        const notificationData = res.data || []
        const unreadCount = notificationData.filter(n => !n.isRead).length
        setUnreadNotificationsCount(unreadCount)
      } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error)
      }
    }
    fetchUnreadCount()
  }, [])

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    setIsProfileMenuOpen(false)
    setIsMessagesOpen(false)
  }

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
    setIsNotificationsOpen(false)
    setIsMessagesOpen(false)
  }

  const toggleMessages = () => {
    setIsMessagesOpen(!isMessagesOpen)
    setIsNotificationsOpen(false)
    setIsProfileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await apiAdmin.post('/auth/logout-admin')
    } catch (err) {
      console.error('Lỗi khi gọi API đăng xuất admin:', err)
    }
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    window.location.href = '/login/admin'
  }

  const handleNotificationsChange = (count) => {
    setUnreadNotificationsCount(count)
  }

  return (
    <header className="flex items-center justify-between h-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 shadow-sm transition-colors duration-300">
      {/* Left side: Toggle button & Brand title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-pink-600 transition-all active:scale-95"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <span className="h-5 w-[2px] bg-slate-300 dark:bg-slate-600 rounded-full" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Hệ thống quản trị PinkFashion
          </span>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3">
        <SwitchAdminHeader />

        {/* Messages Dropdown */}
        <div className="relative">
          <button
            onClick={toggleMessages}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all relative active:scale-95"
          >
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white bg-blue-500 animate-pulse"></span>
          </button>
          {isMessagesOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800">Tin nhắn (2)</h4>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50">
                  <p className="text-sm font-semibold text-slate-800">Nguyễn Văn A</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Sản phẩm này còn hàng không bạn?
                  </p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="text-sm font-semibold text-slate-800">Trần Thị B</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Sản phẩm giao không đúng màu sắc tôi đã chọn.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setActiveTab('chat')
                    setIsMessagesOpen(false)
                  }}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                >
                  Xem tất cả tin nhắn
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all relative active:scale-95"
          >
            <BellIcon className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-sm">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
              <NotificationDropdown
                setActiveTab={setActiveTab}
                setEditingOrder={setEditingOrder}
                setEditingProductId={setEditingProductId}
                userId={userId?.id}
                onNotificationsChange={handleNotificationsChange}
              />
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {userId && (
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              <img
                src={userId?.image || 'https://placehold.co/40x40'}
                alt="Admin Avatar"
                className="w-7 h-7 rounded-xl object-cover border border-slate-200"
              />
              <span className="font-semibold text-sm text-slate-700 hidden md:block">{userId?.name || 'Admin'}</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Admin Info */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                  <img
                    src={userId?.image || 'https://placehold.co/60x60'}
                    alt="Admin Avatar"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{userId?.name || 'Admin'}</p>
                    <p className="text-xs text-slate-400 truncate">{userId?.email}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-50 text-pink-700 border border-pink-100 mt-1 capitalize">
                      Quản trị viên
                    </span>
                  </div>
                </div>

                {/* Account Settings / Actions */}
                <div className="py-1 border-b border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTab('admin-setting')
                      setIsProfileMenuOpen(false)
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2 text-slate-400" />
                    Cài đặt tài khoản
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-2 text-red-400" />
                    Đăng xuất
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thống kê nhanh hôm nay</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <TicketIcon className="w-4 h-4 text-amber-500" /> Đơn chờ xử lý:
                      </span>
                      <span className="font-bold text-slate-800">{stats.pendingOrders}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" /> Doanh thu:
                      </span>
                      <span className="font-bold text-slate-800">
                        {stats.revenue?.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <UserPlusIcon className="w-4 h-4 text-blue-500" /> Khách hàng mới:
                      </span>
                      <span className="font-bold text-slate-800">{stats.newCustomers}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header