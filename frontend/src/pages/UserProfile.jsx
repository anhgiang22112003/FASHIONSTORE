import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { CameraIcon, Lock, UserCircleIcon, X, CheckCircleIcon, PencilIcon, ArrowLeftIcon, User, Phone, Mail, MapPin, Package, Settings, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/service/api'
import { AuthContext } from '@/context/Authcontext'
import OrderDetails from '@/components/OrderDetails'

const OrderStatusVN = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
}

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState('profile')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orders, setOrders] = useState([])
    const [profilePic, setProfilePic] = useState()
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [users, setUsers] = useState()
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState({ text: '', type: '' })
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const handleOrderClick = useCallback((order) => {
        setSelectedOrderId(order._id)
        setActiveTab('orderDetails')
    }, [])

    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            address: '',
            ward: '',
            district: '',
            province: '',
            country: 'Việt Nam',
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
                    province: users?.province || '',
                    country: users?.country || '',
                },
            })
        }
    }, [users])

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/detail')
                setOrders(res.data)
            } catch (error) {
                toast.error('Lỗi khi tải danh sách đơn hàng!')
                console.error(error)
            }
        }

        fetchOrders()
    }, [])

    const { user } = useContext(AuthContext)

    const GetUserId = useCallback(async () => {
        const id = user?.id
        try {
            setIsLoading(true)
            const res = await api.get(`/users/${id}`)
            setUsers(res?.data)
        } catch (error) {
            toast.error("lỗi không lấy được dữ liệu người dùng")
        } finally {
            setTimeout(() => setIsLoading(false), 800)
        }
    }, [user?.id])

    useEffect(() => { GetUserId() }, [GetUserId])

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        if (!userProfile.address.province || !userProfile.address.district || !userProfile.address.ward) {
            toast.error('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, và Phường/Xã.')
            return
        }
        const payload = {
            name: userProfile.name || users?.name,
            phone: userProfile.phone || users?.phone,
            address: userProfile.address.address,
            ward: userProfile.address.ward,
            district: userProfile.address.district,
            province: userProfile.address.province,
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

    useEffect(() => {
        import('@/data/provinces.json').then((data) => setProvinces(data.default));
    }, []);

    useEffect(() => {
        if (provinces.length > 0 && userProfile?.address?.province) {
            const initialProvince = provinces.find(
                (p) => p.name === userProfile.address.province
            )

            if (initialProvince) {
                setDistricts(initialProvince.districts || [])

                if (userProfile.address.district) {
                    const initialDistrict = initialProvince.districts.find(
                        (d) => d.name === userProfile.address.district
                    )

                    if (initialDistrict) {
                        setWards(initialDistrict.wards || [])
                    }
                }
            }
        }
    }, [provinces, userProfile.address.province, userProfile.address.district])

    const handleAddressChange = useCallback((field, value) => {
        setUserProfile(prev => {
            const newAddress = { ...prev.address, [field]: value }

            if (field === 'province') {
                const selectedProvince = provinces.find(p => p.name === value)
                setDistricts(selectedProvince ? selectedProvince.districts : [])
                newAddress.district = ''
                newAddress.ward = ''
                setWards([])

            } else if (field === 'district') {
                const currentProvince = provinces.find(p => p.name === prev.address.province)

                if (currentProvince) {
                    const selectedDistrict = currentProvince.districts.find(d => d.name === value)
                    setWards(selectedDistrict ? selectedDistrict.wards : [])
                }
                newAddress.ward = ''
            }

            return { ...prev, address: newAddress }
        })
    }, [provinces])

    const renderEditProfile = () => (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6 animate-slideUp">
            <div className="flex items-center gap-3 pb-6 border-b-2 border-pink-200">
                <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
                    <PencilIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-800">
                    Chỉnh sửa Hồ sơ
                </h3>
            </div>

            {/* Ảnh đại diện */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 pb-6 border-b border-gray-200">
                <div className="relative mb-4 sm:mb-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-300 object-cover shadow-xl">
                        <img src={profilePic || users?.image} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                    </div>
                    <label
                        htmlFor="profile-pic-upload-edit"
                        className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full cursor-pointer hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg border-3 border-white active:scale-90"
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
                    <p className="font-bold text-gray-800 text-xl">{users?.name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Cập nhật ảnh để thể hiện phong cách của bạn!
                    </p>
                </div>
            </div>

            {/* Form chỉnh sửa thông tin cá nhân */}
            <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <User className="w-4 h-4 text-pink-500" />
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            value={userProfile.name || users?.name || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                            required
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Phone className="w-4 h-4 text-pink-500" />
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            value={userProfile.phone || users?.phone || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                            required
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 text-pink-500" />
                        Email
                    </label>
                    <input
                        type="email"
                        value={userProfile.email || users?.email || ''}
                        readOnly
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Email không thể chỉnh sửa.</p>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        Địa chỉ chi tiết
                    </label>
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
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                        <select
                            value={userProfile.address.province}
                            onChange={(e) => handleAddressChange('province', e.target.value)}
                            required
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                        >
                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                            {provinces.map((province) => (
                                <option key={province.code} value={province.name}>{province.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Quận / Huyện <span className="text-red-500">*</span></label>
                        <select
                            value={userProfile.address.district}
                            onChange={(e) => handleAddressChange('district', e.target.value)}
                            required
                            disabled={!userProfile.address.province || districts.length === 0}
                            className={`w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm ${!userProfile.address.province || districts.length === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        >
                            <option value="">-- Chọn Quận / Huyện --</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.name}>{district.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phường / Xã <span className="text-red-500">*</span></label>
                        <select
                            value={userProfile.address.ward}
                            onChange={(e) => handleAddressChange('ward', e.target.value)}
                            required
                            disabled={!userProfile.address.district || wards.length === 0}
                            className={`w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm ${!userProfile.address.district || wards.length === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        >
                            <option value="">-- Chọn Phường / Xã --</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.name}>{ward.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="px-6 py-3 rounded-xl text-gray-700 font-bold border-2 border-gray-300 hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all active:scale-95"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    )

    const renderPasswordSettings = () => (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 animate-slideUp">
            <div className="flex items-center gap-3 pb-6 border-b-2 border-pink-200 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-800">
                    Cài đặt Tài khoản
                </h3>
            </div>
            <p className="text-gray-600 mb-6 font-medium">Bạn có thể thay đổi mật khẩu tại đây.</p>

            {message.text && (
                <div
                    className={`p-4 rounded-2xl flex items-center space-x-3 mb-6 transition-all duration-300 border-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                    ) : (
                        <X className="w-6 h-6 flex-shrink-0" />
                    )}
                    <p className="font-semibold">{message.text}</p>
                </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Mật khẩu cũ</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Mật khẩu mới</label>
                    <input
                        type="password"
                        value={newPassword}
                        autoComplete="new-password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all active:scale-95"
                >
                    Đổi mật khẩu
                </button>
            </form>
        </div>
    )

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            )
        }

        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6 animate-slideUp">
                        <div className="flex items-center gap-3 pb-6 border-b-2 border-pink-200">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">Thông tin cá nhân</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                                <User className="w-5 h-5 text-pink-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Họ và tên</p>
                                    <p className="font-bold text-gray-800">{users?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Email</p>
                                    <p className="font-bold text-gray-800">{users?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <Phone className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Số điện thoại</p>
                                    <p className="font-bold text-gray-800">{users?.phone}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveTab('editProfile')} 
                            className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all font-black shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            <PencilIcon className="w-5 h-5" />
                            Chỉnh sửa hồ sơ
                        </button>
                    </div>
                )
            case 'editProfile':
                return renderEditProfile()
            case 'orders':
                return (
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6 animate-slideUp">
                        <div className="flex items-center gap-3 pb-6 border-b-2 border-pink-200">
                            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">Lịch sử mua hàng</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Mã đơn hàng</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Ngày</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Tổng tiền</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {orders?.map(order => (
                                        <tr
                                            key={order.id}
                                            onClick={() => handleOrderClick(order)}
                                            className="cursor-pointer hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{order?._id.substring(0, 10).toUpperCase()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                {new Date(order.createdAt).toLocaleString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-600 font-black">{order?.total.toLocaleString()}₫</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'SHIPPED' ? 'bg-orange-100 text-orange-800' :
                                                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                    {OrderStatusVN[order.status]}
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
                if (selectedOrderId) {
                    return (
                        <OrderDetails id={selectedOrderId} onBack={() => setSelectedOrder(null)} />
                    )
                }
                return null

            case 'settings':
                return renderPasswordSettings()
            default:
                return null
        }
    }

    const navItems = useMemo(() => [
        { name: 'Hồ sơ', tab: 'profile', icon: User },
        { name: 'Đơn hàng', tab: 'orders', icon: Package },
        { name: 'Cài đặt', tab: 'settings', icon: Settings },
    ], [])

    const isNavActive = (tab) => activeTab === tab || (activeTab === 'orderDetails' && tab === 'orders')

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 min-h-screen p-4 sm:p-8">
                <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                            <div className="h-8 bg-gray-200 rounded w-48 mt-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-64 mt-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 min-h-screen p-4 sm:p-8 font-sans antialiased">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col items-center animate-slideDown">
                    <div className="flex-shrink-0 relative mb-4">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-500 object-cover shadow-xl">
                            <img className="w-full h-full object-cover" src={users?.image} alt="User Avatar" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-gray-800 mt-0">{users?.name}</h1>
                    <p className="text-gray-500 mt-1 font-medium">{users?.email}</p>
                    <button 
                        onClick={() => setActiveTab('editProfile')} 
                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full font-bold hover:from-pink-200 hover:to-purple-200 transition-all flex items-center space-x-2 shadow-md active:scale-95"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Sửa hồ sơ</span>
                    </button>
                </div>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
                    {/* Sidebar navigation */}
                    <div className="lg:w-1/4">
                        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-4 space-y-2 sticky top-4 animate-slideUp">
                            {navItems.map((item, index) => {
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.tab}
                                        onClick={() => setActiveTab(item.tab)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center gap-3 ${isNavActive(item.tab)
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                                            }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="flex-1">{item.name}</span>
                                        <ChevronRight className={`w-5 h-5 transition-transform ${isNavActive(item.tab) ? 'rotate-90' : ''}`} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="lg:flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.5s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}

export default UserProfile