import React, { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as SolidCheckCircleIcon
} from '@heroicons/react/24/solid';

const AdminSettingsPage = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Admin',
    email: 'admin@example.com',
    phone: '0123456789',
    role: 'Quản trị viên',
    status: 'Online',
    lastLogin: '25/09/2025 09:00 PM',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const roles = ['Quản trị viên', 'Quản lý', 'Nhân viên'];

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    // Logic to update personal info
    console.log('Cập nhật thông tin cá nhân:', personalInfo);
    // You would typically send a request to your API here
    // Cập nhật thông tin cá nhân thành công hoặc thất bại
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    // Logic to change password
    console.log('Thay đổi mật khẩu:', password);
    // You would typically send a request to your API here
    // Thay đổi mật khẩu thành công hoặc thất bại
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
                <span className={`absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                value={personalInfo.name}
                onChange={handlePersonalChange}
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={personalInfo.email}
                onChange={handlePersonalChange}
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={personalInfo.phone}
                onChange={handlePersonalChange}
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Vai trò/Chức vụ
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckBadgeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="role"
                id="role"
                value={personalInfo.role}
                onChange={handlePersonalChange}
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
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
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                 autoComplete="current-password"
                value={password.currentPassword}
                onChange={handlePasswordChange}
                className="block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                 autoComplete="new-password"
                value={password.newPassword}
                onChange={handlePasswordChange}
                className="block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Nhập lại mật khẩu mới
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="password"
                name="confirmNewPassword"
                id="confirmNewPassword"
                value={password.confirmNewPassword}
                onChange={handlePasswordChange}
                className="block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
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
