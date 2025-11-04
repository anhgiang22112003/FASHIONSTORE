import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify' // Dùng toast để hiển thị thông báo
import apiAdmin from '@/service/apiAdmin'

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
    <div className="border border-pink-300 rounded-lg p-2 flex flex-wrap items-center focus-within:ring-2 focus:ring-pink-200">
      {tags.map((tag, index) => (
        <span key={index} className="flex items-center bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded-full mr-2 mb-2">
          {tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="ml-2 text-pink-500 hover:text-pink-800"
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
        className="flex-grow bg-transparent outline-none border-none p-2 mb-2"
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

const CustomerEdit = ({ customer: initialCustomerData, onBack, refreshCustomers }) => { // Đổi tên prop để dễ quản lý
  const [openEmailForm, setOpenEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [openLockForm, setOpenLockForm] = useState(false)
  const [lockReason, setLockReason] = useState("")
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

 useEffect(() => {
  import('@/data/provinces.json').then((data) => setProvinces(data.default));
}, []);

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

  // useEffect để đảm bảo khi customer data thay đổi (nếu component được dùng lại), form sẽ update
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
      await apiAdmin.post(`/users/${initialCustomerData._id}/block`, {
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
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin khách hàng</h2>
          <p className="text-sm text-gray-500">Cập nhật thông tin chi tiết của khách hàng ID: {initialCustomerData?._id}</p>
        </div>
      </div>

      {/* Customer Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
        <div className="space-y-6">
          {/* Họ */}
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
              <span className="font-semibold">Họ</span>
            </div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
          {/* Email */}
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
              <span className="font-semibold">Email</span>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
          {/* Ngày sinh */}
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg>
              <span className="font-semibold">Ngày sinh</span>
            </div>
            <div className="relative">
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </label>
          {/* Nhóm khách hàng */}
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 17.5c-2.33 0-7 1.17-7 3.5V22h14v-1.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
              <span className="font-semibold">Nhóm khách hàng</span>
            </div>
            <select
              name="customerGroup"
              value={formData.customerGroup}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 appearance-none"
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
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
              <span className="font-semibold">Tên</span>
            </div>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
          {/* Số điện thoại */}
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1C10.76 21 2 12.24 2 3c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2z"></path></svg>
              <span className="font-semibold">Số điện thoại</span>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
          {/* Giới tính */}
          <div className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 17.5c-2.33 0-7 1.17-7 3.5V22h14v-1.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
              <span className="font-semibold">Giới tính</span>
            </div>
            <div className="flex items-center space-x-6 h-12">
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="form-radio text-pink-600 w-4 h-4"
                />
                <span>Nam</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="form-radio text-pink-600 w-4 h-4"
                />
                <span>Nữ</span>
              </label>
            </div>
          </div>
          {/* Tags */}
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"></path></svg>
              <span className="font-semibold">Tags</span>
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
      <div className="space-y-6 border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800">Địa chỉ</h3>
        <label className="block space-y-2">
          <span className="font-semibold text-gray-600">Địa chỉ (Số nhà, tên đường)</span>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="VD: 123 Lê Duẩn"
            className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
            <select
              name="province"
              // Giá trị này là TÊN tỉnh: formData.province
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
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
                // Tìm quận/huyện dựa trên **tên** được chọn (e.target.value là tên)
                const selected = districts.find((d) => d.name === e.target.value) 
                setFormData({ ...formData, district: selected ? selected.name : '', ward: '' }) 
                setWards(selected ? selected.wards : []) 
              }}
              disabled={!districts.length}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4] disabled:bg-gray-100"
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
                // Tìm phường/xã dựa trên **tên** được chọn (e.target.value là tên)
                const selected = wards.find((w) => w.name === e.target.value)
                setFormData({ ...formData, ward: selected ? selected.name : '' })
              }}
              disabled={!wards.length}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4] disabled:bg-gray-100"
            >
              <option value="">Chọn phường / xã</option>
              {wards.map((w) => (
                // Dùng **tên** làm giá trị (value) của option
                <option key={w.code} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
          {/* Quốc gia */}
          <label className="block ">
            <span className="font-semibold text-gray-600">Quốc gia</span>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Quốc gia"
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </label>
        </div>
      </div>

      {/* Current Info Section */}
      <div className="bg-pink-50 p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Thông tin hiện tại</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
          <p><span className="font-semibold">Khách hàng từ:</span> {new Date(initialCustomerData?.createdAt).toLocaleDateString()}</p>
          <p><span className="font-semibold">Tổng đơn hàng:</span> {initialCustomerData?.orderCount || 0} đơn</p>
          <p><span className="font-semibold">Tổng chi tiêu:</span> {initialCustomerData?.totalSpent?.toLocaleString() || 0}₫</p>
          <p><span className="font-semibold">Trạng thái:</span> <span className={`${initialCustomerData?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-3 py-1 rounded-full font-medium`}>{initialCustomerData?.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</span></p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8zm13 1h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>
          <span>Hủy bỏ</span>
        </button>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zM5 19V5h11.17L19 7.83V19H5zm4-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path></svg>
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* Other Actions Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Thao tác khác</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6c-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C10.11 19.4 11.96 20 14 20c4.42 0 8-3.58 8-8s-3.58-8-8-8z"></path></svg>
            <span>Xem lịch sử đơn hàng</span>
          </button>
          <button
            onClick={() => setOpenEmailForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
            </svg>
            <span>Gửi email</span>
          </button>

          <button
            onClick={() => setOpenLockForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
          >
            <span>Tạm khóa tài khoản</span>
          </button>

          <button
            onClick={handleGiveVoucher}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors"
          >
            <span>Tặng voucher</span>
          </button>
        </div>
      </div>

      {/* Modal gửi email */}
      {openEmailForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h3 className="text-lg font-bold mb-4">Gửi Email cho khách hàng</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-green-200"
                placeholder="Nhập tiêu đề..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full border rounded-md px-3 py-2 h-28 focus:outline-none focus:ring focus:ring-green-200"
                placeholder="Nhập nội dung email..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenEmailForm(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
      {openLockForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Nhập lý do khóa tài khoản</h3>
            <textarea
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              placeholder="Nhập lý do..."
              className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOpenLockForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerEdit