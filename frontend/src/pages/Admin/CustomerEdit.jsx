import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import apiAdmin from 'service/apiAdmin'
import CustomerOrderHistory from 'components/CustomerOrderHistory'
import {
  ArrowLeftIcon, UserIcon, EnvelopeIcon, CalendarIcon, UsersIcon,
  PhoneIcon, SparklesIcon, TagIcon, MapPinIcon, LockClosedIcon,
  GiftIcon, InboxIcon, XMarkIcon, CheckIcon
} from '@heroicons/react/24/outline'
import {
  AdminInput, AdminSelect, AdminTextarea, AdminCard, AdminModal, AdminButton, StatusBadge
} from 'components/admin/ui'

// ─────────────────────────────────────────────
// TagInput – local sub-component (kept in place, styling updated)
// ─────────────────────────────────────────────
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition-all min-h-[44px]">
      {tags.map((tag, index) => (
        <span key={index} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
          {tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? 'Thêm tag (Enter để xác nhận)…' : ''}
        className="flex-grow bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 min-w-[140px] py-0.5"
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return ''
  try {
    const date = new Date(isoDateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

// ─────────────────────────────────────────────
// CustomerEdit – main component
// ─────────────────────────────────────────────
const CustomerEdit = ({ customer: initialCustomerData, onBack, refreshCustomers, onEditOrder }) => {
  const [openEmailForm, setOpenEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [openLockForm, setOpenLockForm] = useState(false)
  const [lockReason, setLockReason] = useState('')
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [showOrders, setShowOrders] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    import('data/provinces.json').then((data) => setProvinces(data.default))
  }, [])

  useEffect(() => {
    if (provinces.length > 0 && initialCustomerData?.province) {
      const initialProvince = provinces.find((p) => p.name === initialCustomerData.province)
      if (initialProvince) {
        setDistricts(initialProvince.districts || [])
        if (initialCustomerData.district) {
          const initialDistrict = initialProvince.districts.find((d) => d.name === initialCustomerData.district)
          if (initialDistrict) setWards(initialDistrict.wards || [])
        }
      }
    }
  }, [provinces, initialCustomerData])

  const [formData, setFormData] = useState({
    firstName: initialCustomerData?.firstName || '',
    lastName: initialCustomerData?.lastName || '',
    email: initialCustomerData?.email || '',
    phone: initialCustomerData?.phone || '',
    birthDate: formatDateForInput(initialCustomerData?.birthDate),
    gender: initialCustomerData?.gender || 'Nữ',
    address: initialCustomerData?.address || '',
    ward: initialCustomerData?.ward || '',
    district: initialCustomerData?.district || '',
    province: initialCustomerData?.province || '',
    country: initialCustomerData?.country || 'Việt Nam',
    customerGroup: initialCustomerData?.customerGroup || 'Thành viên',
    newsletter: initialCustomerData?.subscribeNewsletter || false,
    smsMarketing: initialCustomerData?.subscribeSMS || false,
    notes: initialCustomerData?.note || '',
    tags: initialCustomerData?.tags || [],
  })

  useEffect(() => {
    if (initialCustomerData) {
      setFormData({
        firstName: initialCustomerData.firstName || '',
        lastName: initialCustomerData.lastName || '',
        email: initialCustomerData.email || '',
        phone: initialCustomerData.phone || '',
        birthDate: formatDateForInput(initialCustomerData.birthDate),
        gender: initialCustomerData.gender || 'Nữ',
        address: initialCustomerData.address || '',
        ward: initialCustomerData.ward || '',
        district: initialCustomerData.district || '',
        province: initialCustomerData.province || '',
        country: initialCustomerData.country || 'Việt Nam',
        customerGroup: initialCustomerData.customerGroup || 'Thành viên',
        newsletter: initialCustomerData.subscribeNewsletter || false,
        smsMarketing: initialCustomerData.subscribeSMS || false,
        notes: initialCustomerData.note || '',
        tags: initialCustomerData.tags || [],
      })
    }
  }, [initialCustomerData])

  // ─── handlers ────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleAddTag = (tag) => {
    if (formData.tags.findIndex((t) => t.toLowerCase() === tag.toLowerCase()) === -1) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    } else {
      toast.info('Tag này đã tồn tại')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) })
  }

  const handleSave = async () => {
    const id = initialCustomerData?._id
    if (!id) { toast.error('Không tìm thấy ID khách hàng để cập nhật.'); return }
    setIsSaving(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate,
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
      const response = await apiAdmin.put(`/users/${id}`, payload)
      if (response.status === 200) {
        toast.success('Cập nhật thông tin khách hàng thành công!')
        onBack()
        await refreshCustomers()
      } else {
        toast.warn('Cập nhật thành công.')
      }
    } catch (err) {
      toast.error(`Lỗi: ${err.response?.data?.message || 'Không thể kết nối API.'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      await apiAdmin.post(`/users/${initialCustomerData._id}/send-welcome`, {
        subject: emailSubject,
        text: emailMessage,
      })
      toast.success('Đã gửi email!')
      setOpenEmailForm(false)
      setEmailSubject('')
      setEmailMessage('')
    } catch {
      toast.error('Lỗi khi gửi email')
    }
  }

  const handleConfirmLock = async () => {
    if (!lockReason.trim()) { toast.warn('Vui lòng nhập lý do khóa tài khoản'); return }
    try {
      await apiAdmin.patch(`/users/${initialCustomerData._id}/status`, { reason: lockReason })
      toast.success('Tài khoản đã bị khóa')
      setOpenLockForm(false)
      setLockReason('')
      onBack()
    } catch {
      toast.error('Lỗi khi khóa tài khoản')
    }
  }

  const handleGiveVoucher = async () => {
    try {
      await apiAdmin.post(`/customers/${initialCustomerData._id}/give-voucher`, {
        voucherCode: 'SALE50', discount: 50, expireDate: '2025-12-31',
      })
      toast.success('Đã tặng voucher')
    } catch {
      toast.error('Lỗi khi tặng voucher')
    }
  }

  // ─── render ───────────────────────────────────
  return (
    <div className="space-y-6 p-5">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            title="Quay lại"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Chỉnh sửa khách hàng</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {initialCustomerData?._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="ghost" size="sm" onClick={onBack}>
            <XMarkIcon className="w-4 h-4 mr-1.5" />
            Hủy bỏ
          </AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            <CheckIcon className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </AdminButton>
        </div>
      </div>

      {/* ── Activity Summary ── */}
      <AdminCard
        title="Tóm tắt hoạt động"
        icon={<SparklesIcon />}
        variant="highlight"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Khách hàng từ', value: new Date(initialCustomerData?.createdAt).toLocaleDateString('vi-VN') },
            { label: 'Tổng đơn hàng', value: `${initialCustomerData?.orderCount || 0} đơn` },
            { label: 'Tổng chi tiêu', value: `${(initialCustomerData?.totalSpent || 0).toLocaleString()}₫`, highlight: true },
            { label: 'Trạng thái', value: <StatusBadge status={initialCustomerData?.status} /> },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <div className={`font-semibold mt-1 text-sm ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* ── Personal Info ── */}
      <AdminCard title="Thông tin cá nhân" icon={<UserIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AdminInput
            label="Họ"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            icon={<UserIcon />}
            placeholder="Nhập họ"
          />
          <AdminInput
            label="Tên"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            icon={<UserIcon />}
            placeholder="Nhập tên"
          />
          <AdminInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            icon={<EnvelopeIcon />}
            placeholder="example@email.com"
          />
          <AdminInput
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            icon={<PhoneIcon />}
            placeholder="0912 345 678"
          />
          <AdminInput
            label="Ngày sinh"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            icon={<CalendarIcon />}
          />

          {/* Giới tính */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Giới tính</p>
            <div className="flex items-center gap-6 h-[42px]">
              {[{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={formData.gender === opt.value}
                    onChange={handleChange}
                    className="accent-indigo-600 w-4 h-4"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <AdminSelect
            label="Nhóm khách hàng"
            name="customerGroup"
            value={formData.customerGroup}
            onChange={handleChange}
          >
            <option value="Thành viên">Thành viên</option>
            <option value="VIP">VIP</option>
            <option value="Khách mới">Khách mới</option>
            <option value="Nhóm VIP">Nhóm VIP</option>
          </AdminSelect>

          {/* Tags */}
          <div className="md:col-span-2 space-y-1.5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TagIcon className="w-4 h-4 text-slate-400" />
              Tags
            </p>
            <TagInput tags={formData.tags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
          </div>
        </div>
      </AdminCard>

      {/* ── Address ── */}
      <AdminCard title="Địa chỉ nhận hàng" icon={<MapPinIcon />}>
        <div className="space-y-4">
          <AdminInput
            label="Địa chỉ (Số nhà, tên đường)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="VD: 123 Lê Duẩn"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminSelect
              label="Tỉnh / Thành phố"
              name="province"
              value={formData.province}
              onChange={(e) => {
                const selectedName = e.target.value
                const selected = provinces.find((p) => p.name === selectedName)
                setFormData({ ...formData, province: selectedName, district: '', ward: '' })
                setDistricts(selected?.districts || [])
                setWards([])
              }}
            >
              <option value="">Chọn tỉnh / thành</option>
              {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
            </AdminSelect>

            <AdminSelect
              label="Quận / Huyện"
              name="district"
              value={formData.district}
              disabled={!districts.length}
              onChange={(e) => {
                const selected = districts.find((d) => d.name === e.target.value)
                setFormData({ ...formData, district: selected ? selected.name : '', ward: '' })
                setWards(selected ? selected.wards : [])
              }}
            >
              <option value="">Chọn quận / huyện</option>
              {districts.map((d) => <option key={d.code} value={d.name}>{d.name}</option>)}
            </AdminSelect>

            <AdminSelect
              label="Phường / Xã"
              name="ward"
              value={formData.ward}
              disabled={!wards.length}
              onChange={(e) => {
                const selected = wards.find((w) => w.name === e.target.value)
                setFormData({ ...formData, ward: selected ? selected.name : '' })
              }}
            >
              <option value="">Chọn phường / xã</option>
              {wards.map((w) => <option key={w.code} value={w.name}>{w.name}</option>)}
            </AdminSelect>
          </div>
          <AdminInput
            label="Quốc gia"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Việt Nam"
          />
        </div>
      </AdminCard>

      {/* ── Notes ── */}
      <AdminCard title="Ghi chú" icon={<InboxIcon />}>
        <AdminTextarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Nhập ghi chú về khách hàng…"
          rows={4}
        />
      </AdminCard>

      {/* ── Account Actions ── */}
      <AdminCard title="Thao tác tài khoản">
        <div className="flex flex-wrap gap-3">
          <AdminButton variant="secondary" size="sm" onClick={() => setShowOrders(true)}>
            <InboxIcon className="w-4 h-4 mr-1.5" />
            Lịch sử đơn hàng
          </AdminButton>
          <AdminButton variant="secondary" size="sm" onClick={() => setOpenEmailForm(true)}>
            <EnvelopeIcon className="w-4 h-4 mr-1.5" />
            Gửi email
          </AdminButton>
          <AdminButton
            variant={initialCustomerData?.status === 'active' ? 'danger' : 'success'}
            size="sm"
            onClick={() => setOpenLockForm(true)}
          >
            <LockClosedIcon className="w-4 h-4 mr-1.5" />
            {initialCustomerData?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          </AdminButton>
          <AdminButton variant="secondary" size="sm" onClick={handleGiveVoucher}>
            <GiftIcon className="w-4 h-4 mr-1.5" />
            Tặng voucher
          </AdminButton>
        </div>
      </AdminCard>

      {/* ── Modal: Gửi Email ── */}
      <AdminModal
        open={openEmailForm}
        onClose={() => setOpenEmailForm(false)}
        title="Gửi email khách hàng"
        description={`Tới: ${initialCustomerData?.email}`}
        size="md"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setOpenEmailForm(false)}>Hủy</AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSendEmail}>Gửi email</AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <AdminInput
            label="Tiêu đề"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Nhập tiêu đề email…"
          />
          <AdminTextarea
            label="Nội dung"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="Nhập nội dung email…"
            rows={5}
          />
        </div>
      </AdminModal>

      {/* ── Modal: Khóa / Mở khóa tài khoản ── */}
      <AdminModal
        open={openLockForm}
        onClose={() => setOpenLockForm(false)}
        title={initialCustomerData?.status === 'inactive' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        description="Hành động này sẽ thay đổi trạng thái tài khoản ngay lập tức."
        size="md"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setOpenLockForm(false)}>Hủy</AdminButton>
            <AdminButton
              variant={initialCustomerData?.status === 'inactive' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleConfirmLock}
            >
              {initialCustomerData?.status === 'inactive' ? 'Xác nhận mở' : 'Xác nhận khóa'}
            </AdminButton>
          </>
        }
      >
        <AdminTextarea
          label="Lý do"
          value={lockReason}
          onChange={(e) => setLockReason(e.target.value)}
          placeholder="Nhập lý do thực hiện…"
          rows={4}
          required
        />
      </AdminModal>

      {/* ── Order History Overlay ── */}
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