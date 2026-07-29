import React, { useEffect, useState, memo } from 'react'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'
import apiUser from '@/service/api'
import { Bell, Package, Star, AlertCircle, CheckCircle } from 'lucide-react'

const NotificationUser = memo(({ userId, setActiveTab, setEditingOrder, setEditingProductId, onNotificationsChange, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Lấy danh sách thông báo
    useEffect(() => {
        if (!userId) return

        const fetchNotifications = async () => {
            try {
                setIsLoading(true)
                const res = await apiUser.get(`/notifications/user/${userId}`)
                const data = res.data || []
                setNotifications(data)

                const unreadCount = data.filter(n => !n.isRead).length
                onNotificationsChange?.(unreadCount)
            } catch (err) {
                console.error('Lỗi khi tải thông báo:', err)
                toast.error('Không thể tải danh sách thông báo')
            } finally {
                setIsLoading(false)
            }
        }

        fetchNotifications()
    }, [userId, onNotificationsChange])

    // Click thông báo
    const handleNotificationClick = async (notification) => {
        const { _id, link, isRead } = notification

        if (!isRead && _id) {
            try {
                // Giữ nguyên logic đánh dấu đã đọc
                await apiAdmin.post(`/notifications/read/${_id}`)

                const updated = notifications.map(n => n._id === _id ? { ...n, isRead: true } : n)
                setNotifications(updated)

                const unreadCount = updated.filter(n => !n.isRead).length
                onNotificationsChange?.(unreadCount)
            } catch (err) {
                console.error('Lỗi khi đánh dấu đã đọc:', err)
            }
        }

        // Giữ nguyên logic điều hướng
        if (typeof link === 'object' && link.tab) {
            setActiveTab?.(link.tab)
            if (link.params?.orderId) setEditingOrder?.(link.params.orderId)
            if (link.params?.productId) setEditingProductId?.(link.params.productId)
        } else if (typeof link === 'string') {
            window.location.href = link
        }
        
        // Đóng pop-up sau khi click
        onClose?.()
    }

    const getNotificationIcon = (type) => {
        // Giữ nguyên kích thước icon mặc định là w-5 h-5
        switch (type) {
            case 'order': return <Package className="w-5 h-5" />
            case 'review': return <Star className="w-5 h-5" />
            case 'product': return <AlertCircle className="w-5 h-5" />
            default: return <CheckCircle className="w-5 h-5" />
        }
    }

    const getNotificationColor = (type) => {
        switch (type) {
            case 'order': return 'from-pink-500 to-rose-500'
            case 'review': return 'from-blue-500 to-indigo-500'
            case 'product': return 'from-amber-500 to-orange-500'
            default: return 'from-green-500 to-emerald-500'
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length
    const totalCount = notifications.length

    // Nếu pop-up đóng, không render gì cả.

    return (
        <>
            {/* Overlay Bổ Sung cho Mobile - Dùng Fixed inset-0 để bắt click, nhưng ở Z-index thấp */}
            {/* Vấn đề chính là Overlay này đang chặn Header. Để xử lý, ta chỉ hiển thị nó khi mobile */}
            <div
              
            />

            {/* Desktop Version - Giữ Nguyên (z-50) */}
            <div className="hidden md:block absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideDown">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">Thông báo</h4>
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                            {unreadCount} mới
                        </span>
                    )}
                </div>

                {/* Danh sách thông báo */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
                                    className={`px-6 py-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`flex-shrink-0 p-2.5 bg-gradient-to-br ${getNotificationColor(n.type)} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                                            <div className="text-white">{getNotificationIcon(n.type)}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{n.title}</p>
                                                {!n.isRead && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5 animate-pulse"></span>}
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{n.message}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(n.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
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
                    <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-center">
                        <a href="#" className="block text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                            Xem tất cả thông báo
                        </a>
                    </div>
                )}
            </div>

            {/* Mobile Version - Pop-up nhỏ bên dưới chuông (Sửa đổi từ Modal cũ) */}
            {/* Sử dụng absolute right-0 và z-50 để đảm bảo nó nằm trên Overlay z-40 và Header */}
            <div className="md:hidden absolute right-0 mt-3 w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideDown">
                
                {/* Header - Đã giảm kích thước */}
                <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-md">
                            <Bell className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Thông báo</h4>
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                            {unreadCount} mới
                        </span>
                    )}
                </div>

                {/* Danh sách thông báo - Đã giới hạn chiều cao max-h-[300px] */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse flex gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
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
                                    className={`px-4 py-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`flex-shrink-0 p-1.5 bg-gradient-to-br ${getNotificationColor(n.type)} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200`}>
                                            {/* Thêm w-4 h-4 vào div bao quanh để ép kích thước icon nhỏ hơn */}
                                            <div className="text-white w-4 h-4">
                                                {getNotificationIcon(n.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {/* Điều chỉnh font-size xuống text-xs và margin/padding nhỏ hơn */}
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{n.title}</p>
                                                {!n.isRead && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 animate-pulse"></span>}
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-0.5 leading-tight">{n.message}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(n.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="inline-flex p-3 bg-gray-100 rounded-full mb-2">
                                <Bell className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-xs font-medium">Không có thông báo nào</p>
                        </div>
                    )}
                </div>

                {/* Footer - Điều chỉnh font-size xuống text-xs */}
                {totalCount > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                        <a href="#" className="block text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                            Xem tất cả thông báo
                        </a>
                    </div>
                )}
            </div>

            {/* Style giữ nguyên */}
            <style jsx>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slideDown { animation: slideDown 0.2s ease-out; }
                .animate-slideUp { animation: slideUp 0.3s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #ec4899, #a855f7); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #db2777, #9333ea); }
                .line-clamp-1 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                }
            `}</style>
        </>
    )
})

NotificationUser.displayName = 'NotificationUser'
export default NotificationUser