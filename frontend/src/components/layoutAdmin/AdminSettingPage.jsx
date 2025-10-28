import React, { useEffect, useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from "react-toastify";
import apiAdmin from "../../service/apiAdmin";

const AdminSettingsPage = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'Online',
    lastLogin: '',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const roles = ['Quản trị viên', 'Quản lý', 'Nhân viên'];

  // 🟢 Gọi API lấy thông tin admin
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await apiAdmin.get("/users/profile/admin");
        const data = res.data;

        setPersonalInfo({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role:
            data.role === 'admin'
              ? 'Quản lý'
              : data.role === 'customer'
              ? 'Nhân viên'
              : 'Quản trị viên',
          status: 'Online',
          lastLogin: data.updatedAt
            ? new Date(data.updatedAt).toLocaleString('vi-VN')
            : 'Không xác định',
        });
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin quản trị viên!");
      }
    };

    fetchAdmin();
  }, []);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  // 🟢 Gọi API cập nhật thông tin cá nhân
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      await apiAdmin.put("/admin/update-info", personalInfo);
      toast.success("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      toast.error("Lỗi khi cập nhật thông tin!");
    }
  };

  // 🟢 Gọi API đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (password.newPassword !== password.confirmNewPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    try {
      await apiAdmin.put("/auth/change-password/admin", {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setPassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đổi mật khẩu thất bại!";
      toast.error(msg);
    }
  };

  const isOnline = personalInfo.status === 'Online';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h1>

      {/* Thông tin cá nhân */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <UserIcon className="w-6 h-6 mr-2 text-pink-600" />
          Thông tin cá nhân
        </h2>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-gray-500" />
            <span
              className={`absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{personalInfo.name}</p>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <CheckBadgeIcon className="w-4 h-4 text-pink-500" />
              <span>{personalInfo.role}</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span>Đăng nhập cuối: {personalInfo.lastLogin}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateInfo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={personalInfo.name}
              onChange={handlePersonalChange}
              className="mt-1 block w-full rounded-md border-gray-300 pl-3 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={personalInfo.email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 pl-3 pr-3 py-2 text-gray-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={personalInfo.phone}
              onChange={handlePersonalChange}
              className="mt-1 block w-full rounded-md border-gray-300 pl-3 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vai trò/Chức vụ</label>
            <select
              name="role"
              value={personalInfo.role}
              onChange={handlePersonalChange}
              disabled
              className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 pl-3 pr-3 py-2 text-gray-500 sm:text-sm"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-pink-600 hover:bg-pink-700 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <KeyIcon className="w-6 h-6 mr-2 text-pink-600" />
          Đổi mật khẩu
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="currentPassword"
              value={password.currentPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={password.newPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={password.confirmNewPassword}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-pink-600 hover:bg-pink-700 transition-colors"
            >
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
