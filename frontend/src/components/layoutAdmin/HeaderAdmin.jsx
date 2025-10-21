import React, { useState } from 'react'
import {
    BellIcon,
    UserCircleIcon,
    Bars3Icon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
    QuestionMarkCircleIcon,
    TicketIcon,
    CurrencyDollarIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline'
import {
    ChatBubbleBottomCenterTextIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/solid'

const Header = ({ toggleSidebar, setActiveTab }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isMessagesOpen, setIsMessagesOpen] = useState(false)

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
   const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login/admin'
    }

    return (
        <header className="flex items-center justify-between h-full px-2.5">
            {/* Nút toggle cho mobile */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pink-600 transition-colors"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Tiêu đề */}
            <h1 className="text-3xl font-bold text-gray-800 hidden lg:block ml-4">Quản trị</h1>

            {/* Icon người dùng và thông báo */}
            <div className="flex items-center space-x-4 ml-auto">
                {/* Icon thông báo */}
                <div className="relative">
                    <button
                        onClick={toggleNotifications}
                         onBlur={() => setIsNotificationsOpen(null)} // 👈 Khi click ra ngoài sẽ đóng select
                          autoFocus // 👈 Tự focus khi hiển thị
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pink-600 transition-colors"
                    >
                        <BellIcon className="w-6 h-6" />
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <h4 className="font-semibold text-gray-800">Thông báo (4)</h4>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                                    <p className="text-sm font-medium text-pink-600">Đơn hàng mới cần xử lý</p>
                                    <p className="text-xs text-gray-500">Đơn hàng #DH123456 vừa được tạo.</p>
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                                    <p className="text-sm font-medium text-yellow-600">Sản phẩm sắp hết kho</p>
                                    <p className="text-xs text-gray-500">Váy Xòe Dịu Dàng chỉ còn 5 sản phẩm.</p>
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                                    <p className="text-sm font-medium text-blue-600">Đánh giá mới</p>
                                    <p className="text-xs text-gray-500">Khách hàng A đã đánh giá sản phẩm Áo Khoác.</p>
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <p className="text-sm font-medium text-green-600">Báo cáo doanh thu</p>
                                    <p className="text-xs text-gray-500">Báo cáo doanh thu hàng ngày đã sẵn sàng.</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 border-t border-gray-200 text-center">
                                <a href="#" className="text-sm font-medium text-pink-600 hover:underline">Xem tất cả</a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Icon tin nhắn */}
                <div className="relative">
                    <button
                        onClick={toggleMessages}
                         onBlur={() => setIsMessagesOpen(null)} // 👈 Khi click ra ngoài sẽ đóng select
                          autoFocus // 👈 Tự focus khi hiển thị
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pink-600 transition-colors"
                    >
                        <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full ring-2 ring-white bg-blue-500"></span>
                    </button>
                    {isMessagesOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-10">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <h4 className="font-semibold text-gray-800">Tin nhắn (2)</h4>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-800">Tin nhắn mới từ Nguyễn Văn A</p>
                                    <p className="text-xs text-gray-500 truncate">Sản phẩm này còn hàng không bạn?</p>
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <p className="text-sm font-medium text-gray-800">Khiếu nại từ Trần Thị B</p>
                                    <p className="text-xs text-gray-500 truncate">Sản phẩm giao không đúng màu sắc tôi đã chọn.</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 border-t border-gray-200 text-center">
                                <a href="#" className="text-sm font-medium text-pink-600 hover:underline">Xem tất cả tin nhắn</a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Menu Icon */}
                <div className="relative">
                    <button
                        onClick={toggleProfileMenu}
                         onBlur={() => setIsProfileMenuOpen(null)} // 👈 Khi click ra ngoài sẽ đóng select
                          autoFocus // 👈 Tự focus khi hiển thị
                        className="flex items-center space-x-2 px-2 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        <UserCircleIcon className="w-8 h-8 text-gray-600" />
                        <span className="font-medium hidden md:block">Admin</span>
                    </button>
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-10">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="font-semibold text-gray-800">Admin</p>
                                <p className="text-sm text-gray-500">Vai trò: Quản trị viên</p>
                            </div>
                            <div className="py-2 space-y-1">
                                <a onClick={() => setActiveTab("admin-setting")} href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                    <Cog6ToothIcon className="w-5 h-5 mr-2 text-gray-500" />
                                    Cài đặt tài khoản
                                </a>
                                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                    <QuestionMarkCircleIcon className="w-5 h-5 mr-2 text-gray-500" />
                                    Hỗ trợ
                                </a>
                                <a onClick={handleLogout} href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2 text-gray-500" />
                                    Đăng xuất
                                </a>
                            </div>
                            <div className="px-4 py-2 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-800">Thống kê nhanh</p>
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center space-x-1"><TicketIcon className="w-4 h-4 text-pink-500" /> Đơn hàng chờ xử lý:</span>
                                        <span className="font-bold">12</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center space-x-1"><CurrencyDollarIcon className="w-4 h-4 text-green-500" /> Doanh thu hôm nay:</span>
                                        <span className="font-bold">5.000.000đ</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center space-x-1"><UserPlusIcon className="w-4 h-4 text-blue-500" /> Khách hàng mới:</span>
                                        <span className="font-bold">5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
