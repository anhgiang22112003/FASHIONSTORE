import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  // State for toggles
  const [codEnabled, setCodEnabled] = useState(true);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);
  const [momoEnabled, setMomoEnabled] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Store Information */}
            <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Thông tin cửa hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block space-y-2">
                  <span className="text-gray-600 font-semibold">Tên cửa hàng</span>
                  <input type="text" defaultValue="PinkFashion" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                </label>
                <label className="block space-y-2">
                  <span className="text-gray-600 font-semibold">Email liên hệ</span>
                  <input type="email" defaultValue="contact@pinkfashion.com" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                </label>
                <label className="block space-y-2">
                  <span className="text-gray-600 font-semibold">Số điện thoại</span>
                  <input type="tel" defaultValue="0123 456 789" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                </label>
                <label className="block space-y-2">
                  <span className="text-gray-600 font-semibold">Địa chỉ</span>
                  <input type="text" defaultValue="123 Đường ABC, Quận 1, TP.HCM" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                </label>
              </div>
              <div className="flex justify-end">
                <button className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>

            {/* Payment and Shipping Settings */}
            <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Cài đặt thanh toán</h3>
              <div className="space-y-4">
                {/* COD */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H3V6h18v12zm-2-6h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H5v-2h2v2zm-2 4h14v-2H5v2z"></path></svg>
                    <span className="font-semibold text-gray-700">Thanh toán khi nhận hàng</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={codEnabled} onChange={() => setCodEnabled(!codEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
                {/* Bank Transfer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12zm-5-6v-2H9v2h6zm-2 4h-2v-2h2v2z"></path></svg>
                    <span className="font-semibold text-gray-700">Chuyển khoản ngân hàng</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={bankTransferEnabled} onChange={() => setBankTransferEnabled(!bankTransferEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
                {/* MoMo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10v4h2v-4h-2zm-2 2h2v-2H9v2zm4 0h2v-2h-2v2z"></path></svg>
                    <span className="font-semibold text-gray-700">Ví điện tử MoMo</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={momoEnabled} onChange={() => setMomoEnabled(!momoEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mt-8">Cài đặt vận chuyển</h3>
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-gray-600 font-semibold">Phí vận chuyển cố định</span>
                  <input type="number" defaultValue="30000" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                </label>
                <label className="block space-y-2">
                  <span className="text-gray-600 font-semibold">Miễn phí vận chuyển từ</span>
                  <input type="number" defaultValue="500000" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
                </label>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Cài đặt Email</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-gray-600">Email quản trị</span>
                <input type="email" defaultValue="admin@pinkfashion.com" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </label>
              <label className="block space-y-2">
                <span className="text-gray-600">Mật khẩu email</span>
                <input type="password" defaultValue="••••••••" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
                Hủy bỏ
              </button>
              <button className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Thay đổi mật khẩu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-gray-600">Mật khẩu hiện tại</span>
                <input type="password" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </label>
              <label className="block space-y-2">
                <span className="text-gray-600">Mật khẩu mới</span>
                <input type="password" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </label>
              <label className="block space-y-2">
                <span className="text-gray-600">Nhập lại mật khẩu mới</span>
                <input type="password" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
              </label>
            </div>
            <div className="flex justify-end space-x-4">
              <button className="px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
                Hủy bỏ
              </button>
              <button className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
                Thay đổi mật khẩu
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${
              activeTab === 'general' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Thông tin chung
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${
              activeTab === 'email' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${
              activeTab === 'password' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mật khẩu
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="bg-pink-50 p-8 rounded-2xl"> {/* Changed outer container to pink-50 */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;