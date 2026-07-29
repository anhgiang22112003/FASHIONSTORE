import React, { useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { toast } from "react-toastify"
import {
  AdminModal, AdminInput, AdminSelect, AdminButton
} from "@/components/admin/ui"

export default function EditStaff({ onClose, refresh, editData, open = true }) {
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
      toast.success(isEdit ? "Cập nhật nhân viên thành công!" : "Thêm nhân viên thành công!")
      refresh()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      description={isEdit ? `Cập nhật thông tin: ${editData?.name}` : "Nhập thông tin để tạo tài khoản nhân viên mới"}
      size="md"
      footer={
        <>
          <AdminButton variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Hủy bỏ
          </AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý…" : isEdit ? "Cập nhật" : "Tạo mới"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminInput
          label="Email"
          name="email"
          type="email"
          placeholder="example@company.com"
          value={form.email}
          onChange={handleChange}
          disabled={isEdit}
          icon={<EnvelopeIcon />}
          required
          hint={isEdit ? "Email không thể thay đổi sau khi tạo" : undefined}
        />

        {!isEdit && (
          <AdminInput
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            icon={<LockClosedIcon />}
            required
          />
        )}

        <AdminInput
          label="Họ và tên"
          name="name"
          type="text"
          placeholder="Nguyễn Văn A"
          value={form.name}
          onChange={handleChange}
          icon={<UserIcon />}
          required
        />

        <AdminInput
          label="Số điện thoại"
          name="phone"
          type="tel"
          placeholder="0123456789"
          value={form.phone}
          onChange={handleChange}
          icon={<PhoneIcon />}
        />

        <AdminSelect
          label="Trạng thái"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </AdminSelect>
      </div>
    </AdminModal>
  )
}