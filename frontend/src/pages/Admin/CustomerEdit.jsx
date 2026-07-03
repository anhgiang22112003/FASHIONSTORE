import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify' // Dùng toast để hiển thị thông báo
import apiAdmin from '@/service/apiAdmin'
import CustomerOrderHistory from '@/components/CustomerOrderHistory'
import { ArrowLeftIcon, UserIcon, EnvelopeIcon, CalendarIcon, UsersIcon, PhoneIcon, TagIcon, MapPinIcon, PencilIcon, LockClosedIcon, GiftIcon, InboxIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

// Component Input Tags đơn giản
const TagInput = ({ tags, onAddTag, onRemoveTag }) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      onAddTag(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-2 flex flex-wrap items-center focus-within:ring-2 focus-within:ring-pink-300 focus-within:border-pink-400 transition-all">
      {tags.map((tag, index) => (
        <span key={index} className="flex items-center bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1 rounded-xl mr-2 mb-1.5 border border-pink-100">
          {tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="ml-2 text-pink-500 hover:text-pink-800 transition-colors font-bold text-sm"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Thêm tag (VD: VIP, Mua nhiều)"
        className="flex-grow bg-transparent outline-none border-none p-1 mb-1 text-sm text-black"
      />
    </div>
  )
}

// Hàm chuyển đổi ISO date sang YYYY-MM-DD
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return ""
  try {
    const date = new Date(isoDateString)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0]
  } catch (e) {
    console.error("Lỗi format ngày:", e)
    return ""
  }
}

const CustomerEdit = ({ customer: initialCustomerData, onBack, refreshCustomers ,onEditOrder}) => { // Đổi tên prop để dễ quản lý
  const [openEmailForm, setOpenEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [openLockForm, setOpenLockForm] = useState(false)
  const [lockReason, setLockReason] = useState("")
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [showOrders, setShowOrders] = useState(false)
  useEffect(() => {
    import('@/data/provinces.json').then((data) => setProvinces(data.default))
  }, [])

  useEffect(() => {
    if (provinces.length > 0 && initialCustomerData?.province) {
      const initialProvince = provinces.find(
        (p) => p.name === initialCustomerData.province
      )
      if (initialProvince) {
        setDistricts(initialProvince.districts || [])
        if (initialCustomerData.district) {
          const initialDistrict = initialProvince.districts.find(
            (d) => d.name === initialCustomerData.district
          )
          if (initialDistrict) {
            setWards(initialDistrict.wards || [])
          }
        }
      }
    }
  }, [provinces, initialCustomerData])
  const [formData, setFormData] = useState({
    firstName: initialCustomerData?.firstName || "",
    lastName: initialCustomerData?.lastName || "",
    email: initialCustomerData?.email || "",
    phone: initialCustomerData?.phone || "",
    birthDate: formatDateForInput(initialCustomerData?.birthDate),
    gender: initialCustomerData?.gender || "Nữ",
    address: initialCustomerData?.address || "",
    ward: initialCustomerData?.ward || "",
    district: initialCustomerData?.district || "",
    province: initialCustomerData?.province || "",
    country: initialCustomerData?.country || "Việt Nam",
    customerGroup: initialCustomerData?.customerGroup || "Thành viên",
    newsletter: initialCustomerData?.subscribeNewsletter || false,
    smsMarketing: initialCustomerData?.subscribeSMS || false,
    notes: initialCustomerData?.note || "",
    tags: initialCustomerData?.tags || [],
  })

  useEffect(() => {
    if (initialCustomerData) {
      setFormData({
        firstName: initialCustomerData.firstName || "",
        lastName: initialCustomerData.lastName || "",
        email: initialCustomerData.email || "",
        phone: initialCustomerData.phone || "",
        birthDate: formatDateForInput(initialCustomerData.birthDate),
        gender: initialCustomerData.gender || "Nữ",
        address: initialCustomerData.address || "",
        ward: initialCustomerData.ward || "",
        district: initialCustomerData.district || "",
        province: initialCustomerData.province || "",
        country: initialCustomerData.country || "Việt Nam",
        customerGroup: initialCustomerData.customerGroup || "Thành viên",
        newsletter: initialCustomerData.subscribeNewsletter || false,
        smsMarketing: initialCustomerData.subscribeSMS || false,
        notes: initialCustomerData.note || "",
        tags: initialCustomerData.tags || [],
      })
    }
  }, [initialCustomerData])
  const handleViewOrders = () => {

    setShowOrders(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    // Xử lý riêng cho newsletter và smsMarketing (nếu có)
    const updateValue = type === "checkbox" ? checked : value

    // Cập nhật state chung
    setFormData({
      ...formData,
      [name]: updateValue,
    })
  }

  const handleAddTag = (tag) => {
    const index = formData.tags.findIndex(t => t.toLowerCase() === tag.toLowerCase())
    if (index === -1) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    } else {
      toast.info("Tag này đã tồn tại")
    }
  }


  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) })
  }


  const handleSave = async () => {
    const id = initialCustomerData?._id
    if (!id) {
      toast.error("Không tìm thấy ID khách hàng để cập nhật.")
      return
    }
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      birthDate: formData.birthDate,

      // Địa chỉ
      address: formData.address,
      ward: formData.ward,
      district: formData.district,
      province: formData.province,
      country: formData.country,

      customerGroup: formData.customerGroup,
      subscribeNewsletter: formData.newsletter,
      subscribeSMS: formData.smsMarketing,
      note: formData.notes,
      tags: formData.tags,
      status: initialCustomerData.status,
    }

    try {

      const response = await apiAdmin.put(`/users/${id}`, payload)
      if (response.status === 200) {
        onBack()
        await refreshCustomers()
        toast.success("Cập nhật thông tin khách hàng thành công!")
        // Có thể gọi lại onBack() hoặc fetch lại dữ liệu
      } else {
        toast.warn("Cập nhật thành công (giả lập thành công, code không phải 200).")
      }
    } catch (err) {
      console.error("Lỗi khi lưu thay đổi:", err)
      toast.error(`Lỗi: ${err.response?.data?.message || "Không thể kết nối API."}`)
    }
  }
  const handleSendEmail = async () => {
    try {
      const res = await apiAdmin.post(`/users/${initialCustomerData._id}/send-welcome`, {
        subject: emailSubject,
        text: emailMessage,
      })
      toast.success("Đã gửi email!")
      setOpenEmailForm(false)
      setEmailSubject('')
      setEmailMessage('')
    } catch (err) {
      toast.error("Lỗi khi gửi email")
    }
  }

  const handleConfirmLock = async () => {
    if (!lockReason.trim()) {
      toast.warn("Vui lòng nhập lý do khóa tài khoản")
      return
    }
    try {
      await apiAdmin.patch(`/users/${initialCustomerData._id}/status`, {
        reason: lockReason
      })
      onBack()
      toast.success("Tài khoản đã bị khóa")
      setOpenLockForm(false)
      setLockReason("")
    } catch (err) {
      toast.error("Lỗi khi khóa tài khoản")
    }
  }

  const handleGiveVoucher = async () => {
    try {
      await axios.post(`/customers/${customer.id}/give-voucher`, {
        voucherCode: "SALE50",
        discount: 50,
        expireDate: "2025-12-31",
      })
      toast.success("Đã tặng voucher")
    } catch (err) {
      toast.error("Lỗi khi tặng voucher")
    }
  }



  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="rounded-2xl shadow-xl p-8 mb-8 space-y-8 font-sans text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-55 hover:text-gray-900 transition-all shadow-sm"
            title="Quay lại"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin khách hàng</h2>
            <p className="text-xs text-gray-500 mt-0.5">Cập nhật thông tin chi tiết của khách hàng ID: {initialCustomerData?._id}</p>
          </div>
        </div>
      </header>

      {/* Customer Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="space-y-6">
          {/* Họ */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <UserIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Họ</span>
            </div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border text-black border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
          </label>
          {/* Email */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <EnvelopeIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Email</span>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
          </label>
          {/* Ngày sinh */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <CalendarIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Ngày sinh</span>
            </div>
            <div className="relative">
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
              />
            </div>
          </label>
          {/* Nhóm khách hàng */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <UsersIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Nhóm khách hàng</span>
            </div>
            <select
              name="customerGroup"
              value={formData.customerGroup}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white transition-all appearance-none"
            >
              <option value="Thành viên">Thành viên</option>
              <option value="VIP">VIP</option>
              <option value="Khách mới">Khách mới</option>
              <option value="Nhóm VIP">Nhóm VIP</option>
            </select>
          </label>
        </div>
        <div className="space-y-6">
          {/* Tên */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <UserIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Tên</span>
            </div>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
          </label>
          {/* Số điện thoại */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <PhoneIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Số điện thoại</span>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 text-black py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
          </label>
          {/* Giới tính */}
          <div className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <UserIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Giới tính</span>
            </div>
            <div className="flex items-center space-x-6 h-11">
              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="form-radio text-pink-600 focus:ring-pink-300 w-4 h-4"
                />
                <span>Nam</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="form-radio text-pink-600 focus:ring-pink-300 w-4 h-4"
                />
                <span>Nữ</span>
              </label>
            </div>
          </div>
          {/* Tags */}
          <label className="block space-y-1.5">
            <div className="flex items-center space-x-2 text-gray-700">
              <TagIcon className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-sm">Tags</span>
            </div>
            <TagInput
              tags={formData.tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
          </label>
        </div>
      </div>

      {/* ADDRESS SECTION */}
      <div className="space-y-6 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5 text-pink-500" />
          <span>Địa chỉ nhận hàng</span>
        </h3>
        <label className="block space-y-1.5">
          <span className="font-semibold text-sm text-gray-700">Địa chỉ (Số nhà, tên đường)</span>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="VD: 123 Lê Duẩn"
            className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
            <select
              name="province"
              value={formData.province}
              onChange={(e) => {
                const selectedName = e.target.value
                const selected = provinces.find((p) => p.name === selectedName)
                setFormData({
                  ...formData,
                  province: selectedName,
                  district: '',
                  ward: ''
                })
                setDistricts(selected?.districts || [])
                setWards([])
              }}
              className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white transition-all"
            >
              <option value="">Chọn tỉnh / thành</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Quận / Huyện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
            <select
              name="district"
              value={formData.district}
              onChange={(e) => {
                const selected = districts.find((d) => d.name === e.target.value)
                setFormData({ ...formData, district: selected ? selected.name : '', ward: '' })
                setWards(selected ? selected.wards : [])
              }}
              disabled={!districts.length}
              className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white disabled:bg-gray-50 transition-all"
            >
              <option value="">Chọn quận / huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
            <select
              name="ward"
              value={formData.ward}
              onChange={(e) => {
                const selected = wards.find((w) => w.name === e.target.value)
                setFormData({ ...formData, ward: selected ? selected.name : '' })
              }}
              disabled={!wards.length}
              className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white disabled:bg-gray-50 transition-all"
            >
              <option value="">Chọn phường / xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
          {/* Quốc gia */}
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</span>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Quốc gia"
              className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
            />
          </label>
        </div>
      </div>

      {/* Current Info Section */}
      <div className="bg-pink-50 border border-pink-100 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-pink-800 flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-pink-500" />
          <span>Tóm tắt hoạt động</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-750">
          <div className="bg-white p-3 rounded-xl shadow-xs border border-pink-100/50">
            <span className="block text-gray-500 text-xs">Khách hàng từ</span>
            <span className="font-semibold text-gray-900 mt-0.5 block">{new Date(initialCustomerData?.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-xs border border-pink-100/50">
            <span className="block text-gray-500 text-xs">Tổng đơn hàng</span>
            <span className="font-semibold text-gray-900 mt-0.5 block">{initialCustomerData?.orderCount || 0} đơn</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-xs border border-pink-100/50">
            <span className="block text-gray-500 text-xs">Tổng chi tiêu</span>
            <span className="font-semibold text-pink-600 mt-0.5 block">{initialCustomerData?.totalSpent?.toLocaleString() || 0}₫</span>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-xs border border-pink-100/50">
            <span className="block text-gray-500 text-xs">Trạng thái</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${initialCustomerData?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {initialCustomerData?.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 border-t border-gray-100 pt-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-5 py-2.5 bg-white text-gray-750 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Hủy bỏ</span>
        </button>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md shadow-pink-200 hover:shadow-pink-300 transition-all"
        >
          <CheckIcon className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* Other Actions Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-800">Thao tác tài khoản</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleViewOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-semibold hover:bg-blue-100 hover:text-blue-700 transition-all text-sm shadow-xs"
          >
            <InboxIcon className="w-4 h-4" />
            <span>Lịch sử đơn hàng</span>
          </button>
          <button
            onClick={() => setOpenEmailForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl font-semibold hover:bg-green-100 hover:text-green-700 transition-all text-sm shadow-xs"
          >
            <EnvelopeIcon className="w-4 h-4" />
            <span>Gửi email</span>
          </button>
          <button
            onClick={() => setOpenLockForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-xl font-semibold hover:bg-yellow-100 hover:text-yellow-750 transition-all text-sm shadow-xs"
          >
            <LockClosedIcon className="w-4 h-4" />
            <span>{initialCustomerData?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
          </button>
          <button
            onClick={handleGiveVoucher}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl font-semibold hover:bg-purple-100 hover:text-purple-700 transition-all text-sm shadow-xs"
          >
            <GiftIcon className="w-4 h-4" />
            <span>Tặng voucher</span>
          </button>
        </div>
      </div>

      {/* Modal gửi email */}
      {openEmailForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-xs z-50 transition-all">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Gửi Email khách hàng</h3>
              <button onClick={() => setOpenEmailForm(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
                  placeholder="Nhập tiêu đề email..."
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Nội dung</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 h-28 text-black text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all resize-none"
                  placeholder="Nhập nội dung email..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setOpenEmailForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-pink-100 transition-all"
              >
                Gửi email
              </button>
            </div>
          </div>
        </div>
      )}

      {openLockForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-xs z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {initialCustomerData.status === "inactive" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              </h3>
              <button onClick={() => setOpenLockForm(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              placeholder="Nhập lý do thực hiện..."
              className="w-full h-28 text-black text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all resize-none"
            />

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setOpenLockForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLock}
                className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all shadow-md ${initialCustomerData.status === "inactive" ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
              >
                {initialCustomerData.status === "inactive" ? "Xác nhận mở" : "Xác nhận khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showOrders && (
        <CustomerOrderHistory
          customerId={initialCustomerData?._id}
          onClose={() => setShowOrders(false)}
          onEditOrder={onEditOrder}
        />
      )}
    </div>
  )
}

export default CustomerEdit