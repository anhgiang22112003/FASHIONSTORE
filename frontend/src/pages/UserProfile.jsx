import React, { useContext, useEffect, useState } from 'react'
import OrderDetails from "./OrderDetail" // Import component chi tiết đơn hàng
import { CameraIcon, LockClosedIcon, UserCircleIcon, XMarkIcon, CheckCircleIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import api from '@/service/api'
import { AuthContext } from '@/context/Authcontext'

// Giả lập dữ liệu người dùng
const userData = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    address: "245 Đường Tôn Đức Thắng, Phường Hàng Bột, Quận Đống Đa, Hà Nội",
    avatar: "https://placehold.co/150x150/f472b6/ffffff?text=AVT",
    orders: [
        {
            id: "12345",
            date: "20/10/2023",
            total: 590000,
            status: "Đang giao",
            shippingMethod: "Giao hàng tiêu chuẩn",
            totalQuantity: 1,
            buyerInfo: { name: "Nguyễn Văn A", phone: "0912345678", address: "245 Đường Tôn Đức Thắng, Quận Đống Đa, Hà Nội" },
            sellerInfo: { name: "PinkFashion Shop", phone: "0987654321" },
            deliveryHistory: [
                { status: "Đơn hàng đã được xác nhận", timestamp: "20/10/2023, 10:00 AM" },
                { status: "Đang đóng gói và chuẩn bị giao hàng", timestamp: "20/10/2023, 11:30 AM" },
                { status: "Đang trên đường giao đến bạn", timestamp: "20/10/2023, 02:00 PM" }
            ],
            items: [
                { name: "Váy xòe hoa nhí", quantity: 1, price: 590000, image: "https://placehold.co/100x100/f472b6/ffffff?text=Váy" }
            ]
        },
        {
            id: "12344",
            date: "15/10/2023",
            total: 350000,
            status: "Đã giao",
            shippingMethod: "Giao hàng nhanh",
            totalQuantity: 3,
            buyerInfo: { name: "Nguyễn Văn A", phone: "0912345678", address: "245 Đường Tôn Đức Thắng, Quận Đống Đa, Hà Nội" },
            sellerInfo: { name: "PinkFashion Shop", phone: "0987654321" },
            deliveryHistory: [
                { status: "Đơn hàng đã được xác nhận", timestamp: "15/10/2023, 09:00 AM" },
                { status: "Đã giao thành công", timestamp: "15/10/2023, 05:00 PM" }
            ],
            items: [
                { name: "Áo phông oversize", quantity: 2, price: 150000, image: "https://placehold.co/100x100/f472b6/ffffff?text=Áo" },
                { name: "Quần jeans rách", quantity: 1, price: 200000, image: "https://placehold.co/100x100/f472b6/ffffff?text=Quần" }
            ]
        },
        {
            id: "12343",
            date: "10/10/2023",
            total: 1200000,
            status: "Đã giao",
            shippingMethod: "Giao hàng tiêu chuẩn",
            totalQuantity: 1,
            buyerInfo: { name: "Nguyễn Văn A", phone: "0912345678", address: "245 Đường Tôn Đức Thắng, Quận Đống Đa, Hà Nội" },
            sellerInfo: { name: "PinkFashion Shop", phone: "0987654321" },
            deliveryHistory: [
                { status: "Đơn hàng đã được xác nhận", timestamp: "10/10/2023, 08:00 AM" },
                { status: "Đã giao thành công", timestamp: "12/10/2023, 11:00 AM" }
            ],
            items: [
                { name: "Đồng hồ dây da", quantity: 1, price: 1200000, image: "https://placehold.co/100x100/f472b6/ffffff?text=ĐH" }
            ]
        },
    ],
}

// Dữ liệu đơn hàng chi tiết giả lập tương tự file OrderDetails.jsx
const detailedOrderData = {
    id: "PF0001",
    status: "Đang giao",
    orderDate: "10/10/2023, 10:00",
    deliveryHistory: [
        { status: "Đã tiếp nhận", time: "10/10/2023, 10:05" },
        { status: "Đã lấy hàng", time: "10/10/2023, 10:30" },
        { status: "Đang xử lý tại kho", time: "10/10/2023, 11:45" },
        { status: "Đang giao", time: "10/10/2023, 14:00" },
    ],
    shippingInfo: {
        name: "Nguyễn Thị Mai",
        phone: "0912 345 678",
        address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
        shippingMethod: "Giao hàng tiêu chuẩn",
    },
    buyerInfo: {
        name: "Nguyễn Thị Lan",
        phone: "0909 876 543",
        address: "456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    },
    paymentSummary: {
        subtotal: 1200000,
        shippingFee: 30000,
        discount: 0,
        total: 1230000,
        paymentMethod: "Thanh toán khi nhận hàng (COD)",
    },
    products: [
        { name: "Váy hoa vintage", quantity: 1, price: 900000, image: "https://placehold.co/100x100/f0d1de/ffffff?text=Váy" },
        { name: "Áo sơ mi thanh lịch", quantity: 1, price: 300000, image: "https://placehold.co/100x100/f0d1de/ffffff?text=Áo" }
    ],
    notes: "Khách hàng yêu cầu gói quà.",
}

const UserProfile = () => {
    // State để quản lý tab đang hoạt động
    const [activeTab, setActiveTab] = useState('profile')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orders, setOrders] = useState(userData.orders)
    const [profilePic, setProfilePic] = useState(userData.avatar)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [users, setUsers] = useState()
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState({ text: '', type: '' })
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            address: '',
            ward: '',
            district: '',
            city: '',
            country: '',
        },
    })
    useEffect(() => {
        if (users) {
            setUserProfile({
                name: users.name || '',
                email: users.email || '',
                phone: users.phone || '',
                address: {
                    address: users?.address || '',
                    ward: users?.ward || '',
                    district: users?.district || '',
                    city: users?.province || '',
                    country: users?.country || '',
                },
            })
        }
    }, [users])


    const { user } = useContext(AuthContext)
    console.log(user);
    
    const GetUserId = async () => {
        const id = user?.id
        console.log(id);
        
        try {
            const res = await api.get(`/users/${id}`)
            setUsers(res?.data)

        } catch (error) {
            toast.error("lỗi không lấy được dữ liệu người dùng")
        }
    }
    useEffect(() => { GetUserId() }, [])

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            name: userProfile.name || users?.name,
            phone: userProfile.phone || users?.phone,
            address: userProfile.address.address,
            ward: userProfile.address.ward,
            district: userProfile.address.district,
            city: userProfile.address.city,
            country: userProfile.address.country,
            image: profilePic,
        }
        try {
            const res = await api.put(`/users/${user?.id}`, payload)
            toast.success('Cập nhật hồ sơ thành công!')
            setUsers(res.data)
            GetUserId()
            setActiveTab('profile')
        } catch (error) {
            toast.error('Cập nhật hồ sơ thất bại!')
        }
    }


    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            if (res.status === 200 || res.status === 201) {
                setProfilePic(res.data.url)
                toast.success('Upload ảnh thành công!')
            }
        } catch (err) {
            toast.error('Upload ảnh thất bại!')
        }

    }
    // Xử lý khi người dùng thay đổi mật khẩu
    const handlePasswordChange = async (e) => {
        e.preventDefault()
        try {
            await api.post('/auth/change-password', {
                userId: users?._id,
                oldPassword,
                newPassword,
            })
            setActiveTab('profile')
            toast.success('Đổi mật khẩu thành công!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const handleOrderClick = (order) => {
        const fullOrderDetails = order.id === '12345' ? detailedOrderData : null
        setSelectedOrder(fullOrderDetails)
        setActiveTab('orderDetails')
    }

    const handleBackToOrders = () => {
        setSelectedOrder(null)
        setActiveTab('orders')
    }


    const renderEditProfile = () => (
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
            <h3 className="text-2xl font-bold text-pink-600 border-b pb-3 mb-4">
                Chỉnh sửa Hồ sơ
            </h3>

            {/* Ảnh đại diện */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 pb-6 border-b">
                <div className="relative mb-4 sm:mb-0">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-200 object-cover shadow-lg">
                        <img src={profilePic} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                    </div>
                    <label
                        htmlFor="profile-pic-upload-edit"
                        className="absolute bottom-0 right-0 p-2 bg-pink-600 rounded-full cursor-pointer hover:bg-pink-700 transition-colors shadow-lg border-2 border-white"
                    >
                        <CameraIcon className="w-5 h-5 text-white" />
                        <input
                            id="profile-pic-upload-edit"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                <div className="text-center sm:text-left">
                    <p className="font-semibold text-gray-800 text-lg">{users?.name}</p>
                    <p className="text-gray-500 text-sm">
                        Cập nhật ảnh để thể hiện phong cách của bạn!
                    </p>
                </div>
            </div>

            {/* Form chỉnh sửa thông tin cá nhân */}
            <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Họ và tên */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Họ và tên</label>
                    <input
                        type="text"
                        value={userProfile.name || users?.name || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        required
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                </div>

                {/* Email (không chỉnh sửa) */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={userProfile.email || users?.email || ''}
                        readOnly
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email không thể chỉnh sửa.</p>
                </div>

                {/* Số điện thoại */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Số điện thoại</label>
                    <input
                        type="tel"
                        value={userProfile.phone || users?.phone || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        required
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                </div>

                {/* Địa chỉ chi tiết */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Địa chỉ</label>
                        <input
                            type="text"
                            value={userProfile.address.address}
                            onChange={(e) =>
                                setUserProfile({
                                    ...userProfile,
                                    address: { ...userProfile.address, address: e.target.value },
                                })
                            }
                            placeholder="Số nhà, tên đường..."
                            className="w-full px-5 py-3 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                        />
                    </div>
                </div>


                {/* Phường/Xã */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Phường / Xã</label>
                    <input
                        type="text"
                        value={userProfile.address.ward}
                        onChange={(e) =>
                            setUserProfile({
                                ...userProfile,
                                address: { ...userProfile.address, ward: e.target.value },
                            })
                        }
                        placeholder="Nhập phường / xã"
                        className="w-full px-5 py-3 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                </div>

                {/* Quận / Huyện */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Quận / Huyện</label>
                    <input
                        type="text"
                        value={userProfile.address.district}
                        onChange={(e) =>
                            setUserProfile({
                                ...userProfile,
                                address: { ...userProfile.address, district: e.target.value },
                            })
                        }
                        placeholder="Nhập quận / huyện"
                        className="w-full px-5 py-3 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                </div>

                {/* Tỉnh / Thành phố */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Tỉnh / Thành phố</label>
                    <input
                        type="text"
                        value={userProfile.address.city}
                        onChange={(e) =>
                            setUserProfile({
                                ...userProfile,
                                address: { ...userProfile.address, city: e.target.value },
                            })
                        }
                        placeholder="Nhập tỉnh / thành phố"
                        className="w-full px-5 py-3 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                </div>

                {/* Quốc gia */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Quốc gia</label>
                    <input
                        type="text"
                        value={userProfile.address.country}
                        onChange={(e) =>
                            setUserProfile({
                                ...userProfile,
                                address: { ...userProfile.address, country: e.target.value },
                            })
                        }
                        placeholder="Nhập quốc gia"
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                </div>


                {/* Nút hành động */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="px-6 py-3 rounded-xl text-gray-700 font-semibold border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-lg hover:bg-pink-600 transition-colors"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    )

    // Giao diện: Đổi mật khẩu
    const renderPasswordSettings = () => (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <LockClosedIcon className="w-6 h-6 text-pink-500" />
                <span>Cài đặt Tài khoản</span>
            </h3>
            <p className="text-gray-600 mb-6">Bạn có thể thay đổi mật khẩu tại đây.</p>

            {/* Hiển thị thông báo */}
            {message.text && (
                <div
                    className={`p-4 rounded-xl flex items-center space-x-3 mb-6 transition-all duration-300 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                    ) : (
                        <XMarkIcon className="w-6 h-6 flex-shrink-0" />
                    )}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Form đổi mật khẩu */}
            <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Mật khẩu cũ</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Mật khẩu mới</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-lg hover:bg-pink-600 transition-colors"
                >
                    Đổi mật khẩu
                </button>
            </form>
        </div>
    )

    // Hàm render nội dung chính
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium text-gray-600">Họ và tên:</span> {users?.name}</p>
                            <p><span className="font-medium text-gray-600">Email:</span> {users?.email}</p>
                            <p><span className="font-medium text-gray-600">Số điện thoại:</span> {users?.phone}</p>
                        </div>
                        <button onClick={() => setActiveTab('editProfile')} className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium shadow-md">Chỉnh sửa</button>
                    </div>
                )
            case 'editProfile':
                return renderEditProfile() // Giao diện chỉnh sửa hồ sơ mới
            case 'orders':
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Lịch sử mua hàng</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn hàng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map(order => (
                                        <tr
                                            key={order.id}
                                            onClick={() => handleOrderClick(order)}
                                            className="cursor-pointer hover:bg-pink-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-600 font-semibold">{order.total.toLocaleString()}đ</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Đang giao' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            case 'orderDetails':
                if (selectedOrder) {
                    return (
                        <OrderDetails orderData={selectedOrder} onBack={handleBackToOrders} />
                    )
                }
                return null

            case 'settings':
                return renderPasswordSettings() // Chỉ hiển thị đổi mật khẩu
            default:
                return null
        }
    }

    const navItems = [
        { name: 'Hồ sơ', tab: 'profile' },
        { name: 'Đơn hàng', tab: 'orders' },
        // { name: 'Địa chỉ', tab: 'address' },
        { name: 'Cài đặt', tab: 'settings' },
    ]

    // Lọc lại navItems nếu đang ở tab orderDetails hoặc editProfile, để sidebar không bị chọn 
    const isNavActive = (tab) => activeTab === tab || (activeTab === 'orderDetails' && tab === 'orders')

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans antialiased">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header (Phần thông tin tóm tắt bên trên) */}
                <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
                    <div className="flex-shrink-0 relative mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 object-cover shadow-lg">
                            <img className="w-full h-full object-cover" src={users?.image} alt="User Avatar" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mt-0">{users?.name}</h1>
                    <p className="text-gray-500 mt-1">{users?.email}</p>
                    <button onClick={() => setActiveTab('editProfile')} className="mt-4 px-6 py-2 bg-pink-100 text-pink-600 rounded-full font-semibold hover:bg-pink-200 transition-colors flex items-center space-x-2 shadow-md">
                        <PencilIcon className="w-4 h-4" />
                        <span>Sửa hồ sơ</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
                    {/* Sidebar navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-md p-4 space-y-2 sticky top-4">
                            {navItems.map(item => (
                                <button
                                    key={item.tab}
                                    onClick={() => setActiveTab(item.tab)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${isNavActive(item.tab)
                                            ? 'bg-pink-100 text-pink-600 shadow-inner'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.name}
                                </button>

                            ))}
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="lg:flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile