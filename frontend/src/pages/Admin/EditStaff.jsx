import React, { useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { toast } from "react-toastify"

export default function EditStaff({ onClose, refresh, editData }) {
  const isEdit = Boolean(editData)

  const [form, setForm] = useState({
    email: editData?.email || "",
    name: editData?.name || "",
    phone: editData?.phone || "",
    password: "",
    status: editData?.status || "active",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (isEdit) {
        await apiAdmin.put(`/users/staff/${editData._id}`, form)
      } else {
        await apiAdmin.post("/users/staff", form)
      }
      refresh()
      onClose()
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-500" />
              <span>Email</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="example@company.com"
              value={form.email}
              onChange={handleChange}
              disabled={isEdit}
              className={`w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isEdit ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            />
          </div>

          {/* Password Field (Only for new staff) */}
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <LockClosedIcon className="w-4 h-4 text-gray-500" />
                <span>Mật khẩu</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 text-black border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span>Họ và tên</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <PhoneIcon className="w-4 h-4 text-gray-500" />
              <span>Số điện thoại</span>
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="0123456789"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-gray-500" />
              <span>Trạng thái</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 text-black py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
            >
              <option value="active"> Hoạt động</option>
              <option value="inactive"> Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{isEdit ? "Cập nhật" : "Tạo mới"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}