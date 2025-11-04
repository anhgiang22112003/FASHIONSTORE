import React, { useEffect, useState } from 'react'
import { UserCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'

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

  // ✅ Lấy danh sách tỉnh/thành Việt Nam khi mở form
 useEffect(() => {
    import('@/data/provinces.json')
      .then((module) => setProvinces(module.default))
      .catch((err) => console.error('Lỗi tải tỉnh thành từ JSON:', err));
  }, []);

  // ✅ Khi chọn tỉnh thì load quận/huyện
  useEffect(() => {
    if (formData.province) {
      const province = provinces.find((p) => p.name === formData.province);
      setDistricts(province?.districts || []);
      setFormData((prev) => ({ ...prev, district: '', ward: '' }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
      setFormData((prev) => ({ ...prev, district: '', ward: '' }));
    }
  }, [formData.province, provinces]);

  // ✅ Khi chọn quận/huyện thì load phường/xã
  useEffect(() => {
    if (formData.district) {
      const district = districts.find((d) => d.name === formData.district);
      setWards(district?.wards || []);
      setFormData((prev) => ({ ...prev, ward: '' }));
    } else {
      setWards([]);
      setFormData((prev) => ({ ...prev, ward: '' }));
    }
  }, [formData.district, districts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleTagClick = (tag) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) }
      } else {
        return { ...prev, tags: [...prev.tags, tag] }
      }
    })
  }

  const isFormValid = () => {
    return formData.firstName.trim() !== '' && formData.lastName.trim() !== '' && formData.email.trim() !== ''
  }

  const handleSave = async () => {
    try {
      const response = await apiAdmin.post('/users', formData)
      if (response.status === 201) {
        toast.success("Thêm khách hàng thành công!")
        await refreshCustomers() // Tải lại danh sách khách hàng
        onBack()
      } else {
        toast.error("Thêm khách hàng thất bại!")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra!")
    }

  }


  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm khách hàng mới</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isFormValid() ? 'bg-[#ff69b4] hover:bg-[#ff4f9f] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>Lưu khách hàng</span>
          </button>
          {/* <button
            onClick={handleSaveAndAddMore}
            disabled={!isFormValid()}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isFormValid() ? 'bg-pink-100 hover:bg-pink-200 text-[#ff69b4]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Lưu và thêm mới</span>
          </button> */}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" placeholder="Nhập họ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" placeholder="Nhập tên" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" placeholder="vd: example@mail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]">
                  <option value="N/A">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Địa chỉ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" placeholder="vd: 123 Lê Duẩn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      province: e.target.value,
                      district: '',
                      ward: '',
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff69b4]"
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn quận/huyện */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      district: e.target.value,
                      ward: '',
                    })
                  }}
                  disabled={!formData.province}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff69b4]"
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn phường/xã */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff69b4]"
                >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]" placeholder="Quốc gia" />
              </div>
            </div>
          </div>

          {/* Sở thích & Marketing */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Sở thích & Marketing</h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 mr-2">Thẻ khách hàng:</span>
              {['Vip', 'Đã mua', 'Chưa mua', 'Phụ nữ', 'Đàn ông', 'Gucci'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.tags.includes(tag) ? 'bg-pink-100 text-[#ff69b4] border border-[#ff69b4]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Đăng ký nhận Newsletter</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-300 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff69b4]"></div>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Marketing qua SMS</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="smsMarketing" checked={formData.smsMarketing} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-300 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff69b4]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Cài đặt tài khoản */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Cài đặt tài khoản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm khách hàng</label>
                <select name="customerGroup" value={formData.customerGroup} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]">
                  <option value="">Chọn nhóm</option>
                  <option value="Nhóm VIP">Nhóm VIP</option>
                  <option value="Khách hàng thường">Khách hàng thường</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4]">
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú phụ về khách hàng</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff69b4] resize-none h-24" placeholder="Nhập ghi chú..."></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Xem trước thông tin</h2>
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                <UserCircleIcon className="w-12 h-12 text-[#ff69b4]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{formData.lastName} {formData.firstName}</h3>
              <p className="text-gray-600 text-sm">{formData.email}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm mb-2">
                <span className="font-semibold text-gray-700">Ngày sinh:</span>
                <span className="ml-2 text-gray-600">{formData.birthDate || 'N/A'}</span>
              </div>
              <div className="text-sm mb-2">
                <span className="font-semibold text-gray-700">Giới tính:</span>
                <span className="ml-2 text-gray-600">{formData.gender}</span>
              </div>
              <div className="text-sm mb-2">
                <span className="font-semibold text-gray-700">Thẻ khách hàng:</span>
                <span className="ml-2 text-gray-600">{formData.tags.join(', ') || 'N/A'}</span>
              </div>
              <div className="text-sm mb-2">
                <span className="font-semibold text-gray-700">Địa chỉ:</span>
                <span className="ml-2 text-gray-600">{formData.address || 'N/A'}</span>
              </div>
              <div className="text-sm mb-2">
                <span className="font-semibold text-gray-700">Ghi chú:</span>
                <span className="ml-2 text-gray-600">{formData.notes || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Hướng dẫn</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start text-gray-700">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-pink-100 text-[#ff69b4] font-bold text-xs mr-2 flex-shrink-0">1</span>
                <span>Điền đầy đủ thông tin cá nhân và địa chỉ</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-pink-100 text-[#ff69b4] font-bold text-xs mr-2 flex-shrink-0">2</span>
                <span>Chọn các thẻ phù hợp cho khách hàng</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-pink-100 text-[#ff69b4] font-bold text-xs mr-2 flex-shrink-0">3</span>
                <span>Cập nhật trạng thái và nhóm khách hàng</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-pink-100 text-[#ff69b4] font-bold text-xs mr-2 flex-shrink-0">4</span>
                <span>Thêm ghi chú nếu cần thiết</span>
              </li>
              <li className="flex items-start text-gray-700">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-pink-100 text-[#ff69b4] font-bold text-xs mr-2 flex-shrink-0">5</span>
                <span>Kiểm tra lại thông tin trước khi lưu</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCustomerPage
