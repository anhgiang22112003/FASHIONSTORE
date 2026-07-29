import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'
import {
  ArrowLeftIcon, UserCircleIcon, CheckCircleIcon, XMarkIcon,
  UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, MapPinIcon,
  TagIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline'
import {
  AdminInput, AdminSelect, AdminTextarea, AdminCard, AdminButton
} from '@/components/admin/ui'

// ─────────────────────────────────────────────
const PRESET_TAGS = ['Vip', 'Đã mua', 'Chưa mua', 'Phụ nữ', 'Đàn ông', 'Gucci']

const AddCustomerPage = ({ onBack, refreshCustomers }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'N/A',
    address: '',
    ward: '',
    district: '',
    province: '',
    country: '',
    tags: [],
    newsletter: false,
    smsMarketing: false,
    status: 'Hoạt động',
    customerGroup: '',
    notes: '',
  })
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    import('@/data/provinces.json')
      .then((module) => setProvinces(module.default))
      .catch((err) => console.error('Lỗi tải tỉnh thành từ JSON:', err))
  }, [])

  useEffect(() => {
    if (formData.province) {
      const province = provinces.find((p) => p.name === formData.province)
      setDistricts(province?.districts || [])
      setFormData((prev) => ({ ...prev, district: '', ward: '' }))
      setWards([])
    } else {
      setDistricts([])
      setWards([])
      setFormData((prev) => ({ ...prev, district: '', ward: '' }))
    }
  }, [formData.province, provinces])

  useEffect(() => {
    if (formData.district) {
      const district = districts.find((d) => d.name === formData.district)
      setWards(district?.wards || [])
      setFormData((prev) => ({ ...prev, ward: '' }))
    } else {
      setWards([])
      setFormData((prev) => ({ ...prev, ward: '' }))
    }
  }, [formData.district, districts])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleTagClick = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const isFormValid = () =>
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== ''

  const handleSave = async () => {
    if (!isFormValid()) { toast.warn('Vui lòng điền đầy đủ họ, tên và email.'); return }
    setIsSaving(true)
    try {
      const response = await apiAdmin.post('/users', formData)
      if (response.status === 201) {
        toast.success('Thêm khách hàng thành công!')
        await refreshCustomers()
        onBack()
      } else {
        toast.error('Thêm khách hàng thất bại!')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra!')
    } finally {
      setIsSaving(false)
    }
  }

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
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Thêm khách hàng mới</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Nhập thông tin để tạo hồ sơ khách hàng mới</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="ghost" size="sm" onClick={onBack}>
            <XMarkIcon className="w-4 h-4 mr-1.5" />
            Hủy
          </AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handleSave} disabled={!isFormValid() || isSaving}>
            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Đang lưu…' : 'Lưu khách hàng'}
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left / Main Content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info */}
          <AdminCard title="Thông tin cá nhân" icon={<UserIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AdminInput
                label="Họ"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nhập họ"
                required
              />
              <AdminInput
                label="Tên"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Nhập tên"
                required
              />
              <AdminInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={<EnvelopeIcon />}
                placeholder="vd: example@mail.com"
                required
              />
              <AdminInput
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                icon={<PhoneIcon />}
                placeholder="Nhập số điện thoại"
              />
              <AdminInput
                label="Ngày sinh"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                icon={<CalendarIcon />}
              />
              <AdminSelect
                label="Giới tính"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="N/A">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </AdminSelect>
            </div>
          </AdminCard>

          {/* Address */}
          <AdminCard title="Địa chỉ" icon={<MapPinIcon />}>
            <div className="space-y-4">
              <AdminInput
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="vd: 123 Lê Duẩn"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AdminSelect
                  label="Tỉnh/Thành phố"
                  name="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '', ward: '' })}
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
                </AdminSelect>
                <AdminSelect
                  label="Quận/Huyện"
                  name="district"
                  value={formData.district}
                  disabled={!formData.province}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value, ward: '' })}
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map((d) => <option key={d.code} value={d.name}>{d.name}</option>)}
                </AdminSelect>
                <AdminSelect
                  label="Phường/Xã"
                  name="ward"
                  value={formData.ward}
                  disabled={!formData.district}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map((w) => <option key={w.code} value={w.name}>{w.name}</option>)}
                </AdminSelect>
              </div>
              <AdminInput
                label="Quốc gia"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Quốc gia"
              />
            </div>
          </AdminCard>

          {/* Tags & Marketing */}
          <AdminCard title="Thẻ & Marketing" icon={<TagIcon />}>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thẻ khách hàng</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all font-medium ${formData.tags.includes(tag)
                          ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  { name: 'newsletter', label: 'Đăng ký nhận Newsletter' },
                  { name: 'smsMarketing', label: 'Marketing qua SMS' },
                ].map(({ name, label }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className="sr-only peer" />
                      <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-400 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>

          {/* Account Settings */}
          <AdminCard title="Cài đặt tài khoản" icon={<Cog6ToothIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AdminSelect
                label="Nhóm khách hàng"
                name="customerGroup"
                value={formData.customerGroup}
                onChange={handleChange}
              >
                <option value="">Chọn nhóm</option>
                <option value="Nhóm VIP">Nhóm VIP</option>
                <option value="Khách hàng thường">Khách hàng thường</option>
              </AdminSelect>
              <AdminSelect
                label="Trạng thái"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </AdminSelect>
              <div className="md:col-span-2">
                <AdminTextarea
                  label="Ghi chú phụ về khách hàng"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Nhập ghi chú…"
                  rows={3}
                />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-6">
          {/* Preview Card */}
          <AdminCard title="Xem trước thông tin">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mb-3">
                <UserCircleIcon className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {[formData.lastName, formData.firstName].filter(Boolean).join(' ') || 'Chưa nhập tên'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formData.email || '—'}</p>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Ngày sinh', value: formData.birthDate || 'N/A' },
                { label: 'Giới tính', value: formData.gender === 'female' ? 'Nữ' : formData.gender === 'male' ? 'Nam' : 'N/A' },
                { label: 'Tags', value: formData.tags.join(', ') || 'N/A' },
                { label: 'Địa chỉ', value: formData.address || 'N/A' },
                { label: 'Ghi chú', value: formData.notes || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">{label}:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate">{value}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Guide Card */}
          <AdminCard title="Hướng dẫn" variant="highlight">
            <ol className="space-y-3">
              {[
                'Điền đầy đủ thông tin cá nhân và địa chỉ',
                'Chọn các thẻ phù hợp cho khách hàng',
                'Cập nhật trạng thái và nhóm khách hàng',
                'Thêm ghi chú nếu cần thiết',
                'Kiểm tra lại thông tin trước khi lưu',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

export default AddCustomerPage
