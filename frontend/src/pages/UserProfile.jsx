import React, { useState } from 'react';
import OrderDetails from "./OrderDetail"; // Import component chi tiết đơn hàng
import { CameraIcon, LockClosedIcon, UserCircleIcon, XMarkIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/solid';

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
};

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
};

const UserProfile = () => {
    // State để quản lý tab đang hoạt động
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState(userData.orders);

    // State cho chức năng tải ảnh và đổi mật khẩu
    const [profilePic, setProfilePic] = useState(userData.avatar);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    // Xử lý khi người dùng chọn file ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfilePic(imageUrl);
            setMessage({ text: 'Ảnh đại diện đã được cập nhật thành công!', type: 'success' });
            // Logic tải ảnh lên server
        }
    };

    // Xử lý khi người dùng thay đổi mật khẩu
    const handlePasswordChange = (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Mật khẩu mới và mật khẩu xác nhận không khớp!', type: 'error' });
            return;
        }

        // Giả lập logic xác thực
        if (oldPassword === '123456') {
            setMessage({ text: 'Mật khẩu đã được thay đổi thành công!', type: 'success' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ text: 'Mật khẩu cũ không chính xác!', type: 'error' });
        }
    };

    const handleOrderClick = (order) => {
        const fullOrderDetails = order.id === '12345' ? detailedOrderData : null;
        setSelectedOrder(fullOrderDetails);
        setActiveTab('orderDetails');
    };

    const handleBackToOrders = () => {
        setSelectedOrder(null);
        setActiveTab('orders');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium text-gray-600">Họ và tên:</span> {userData.name}</p>
                            <p><span className="font-medium text-gray-600">Email:</span> {userData.email}</p>
                            <p><span className="font-medium text-gray-600">Số điện thoại:</span> {userData.phone}</p>
                        </div>
                        <button onClick={() => setActiveTab('settings')} className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors">Chỉnh sửa</button>
                    </div>
                );
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
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
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
                );
            case 'orderDetails':
                if (selectedOrder) {
                    return (
                        <OrderDetails orderData={selectedOrder} onBack={handleBackToOrders} />
                    );
                }
                return null;
            case 'address':
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Địa chỉ</h3>
                        <p className="text-gray-600">{userData.address}</p>
                        <button className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors">Chỉnh sửa</button>
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-8">
                        {/* Phần tải ảnh đại diện */}
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                <UserCircleIcon className="w-6 h-6 text-pink-500" />
                                <span>Ảnh đại diện</span>
                            </h3>
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    <img src={profilePic} alt="Ảnh đại diện" className="object-cover w-full h-full" />
                                </div>
                                {/* Nút tải ảnh mới bên cạnh */}
                                <label
                                    htmlFor="profile-pic-upload"
                                    className="p-3 bg-pink-100 rounded-full cursor-pointer hover:bg-pink-200 transition-colors"
                                    aria-label="Tải ảnh đại diện"
                                >
                                    <CameraIcon className="w-5 h-5 text-pink-600" />
                                    <input
                                        id="profile-pic-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <p className="text-gray-600">Tải lên một bức ảnh mới để thay đổi ảnh đại diện của bạn.</p>
                            </div>
                        </div>

                        {/* Phần đổi mật khẩu */}
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                <LockClosedIcon className="w-6 h-6 text-pink-500" />
                                <span>Thay đổi mật khẩu</span>
                            </h3>

                            {/* Hiển thị thông báo */}
                            {message.text && (
                                <div
                                    className={`p-4 rounded-xl flex items-center space-x-3 mb-6 transition-all duration-300 ${
                                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-lg hover:bg-pink-600 transition-colors"
                                >
                                    Lưu thay đổi
                                </button>
                            </form>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const navItems = [
        { name: 'Hồ sơ', tab: 'profile' },
        { name: 'Đơn hàng', tab: 'orders' },
        { name: 'Địa chỉ', tab: 'address' },
        { name: 'Cài đặt', tab: 'settings' },
    ];

    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans antialiased">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
                    <div className="flex items-center space-x-4 mb-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                            <img className="w-24 h-24 rounded-full border-4 border-pink-500 object-cover shadow-lg" src={profilePic} alt="User Avatar" />
                        </div>
                        {/* Nút tải ảnh mới */}
                        <label
                            htmlFor="profile-pic-upload-header"
                            className="p-3 bg-pink-100 rounded-full cursor-pointer hover:bg-pink-200 transition-colors"
                            aria-label="Tải ảnh đại diện"
                        >
                            <CameraIcon className="w-5 h-5 text-pink-600" />
                            <input
                                id="profile-pic-upload-header"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mt-0">{userData.name}</h1>
                    <p className="text-gray-500 mt-1">{userData.email}</p>
                    <button onClick={() => setActiveTab('settings')} className="mt-4 px-6 py-2 bg-pink-100 text-pink-600 rounded-full font-semibold hover:bg-pink-200 transition-colors flex items-center space-x-2">
                        <PencilIcon className="w-4 h-4" />
                        <span>Sửa hồ sơ</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
                    {/* Sidebar navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-md p-4 space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.tab}
                                    onClick={() => setActiveTab(item.tab)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${
                                        activeTab === item.tab
                                            ? 'bg-pink-100 text-pink-600 shadow'
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
    );
};

// Component chi tiết đơn hàng được đặt ở cuối file
// eslint-disable-next-line react/prop-types


export default UserProfile;
