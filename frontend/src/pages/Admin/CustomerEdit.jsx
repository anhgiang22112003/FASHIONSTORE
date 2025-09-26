import React from 'react';

const CustomerEdit = ({ customer, onBack }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin khách hàng</h2>
          <p className="text-sm text-gray-500">Cập nhật thông tin chi tiết của khách hàng</p>
        </div>
      </div>
      
      {/* Customer Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
        <div className="space-y-6">
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
              <span className="font-semibold">Họ và tên</span>
            </div>
            <input type="text" value="Nguyễn Thị Lan" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </label>
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
              <span className="font-semibold">Email</span>
            </div>
            <input type="email" value="lan.nguyen@email.com" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </label>
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1C10.76 21 2 12.24 2 3c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2z"></path></svg>
              <span className="font-semibold">Số điện thoại</span>
            </div>
            <input type="tel" value="0123456789" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </label>
        </div>
        <div className="space-y-6">
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
              <span className="font-semibold">Địa chỉ</span>
            </div>
            <input type="text" value="123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
          </label>
          <label className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg>
              <span className="font-semibold">Ngày sinh</span>
            </div>
            <div className="relative">
              <input type="text" value="15/05/1995" className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200" />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7v-2zm-2 2h2v-2H5v2z"></path></svg>
              </button>
            </div>
          </label>
          <div className="block space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 17.5c-2.33 0-7 1.17-7 3.5V22h14v-1.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
              <span className="font-semibold">Giới tính</span>
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="radio" name="gender" value="male" className="form-radio text-pink-600 w-4 h-4" />
                <span>Nam</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="radio" name="gender" value="female" checked className="form-radio text-pink-600 w-4 h-4" />
                <span>Nữ</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current Info Section */}
      <div className="bg-pink-50 p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Thông tin hiện tại</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
          <p><span className="font-semibold">Khách hàng từ:</span> Tháng 3, 2023</p>
          <p><span className="font-semibold">Tổng đơn hàng:</span> 12 đơn</p>
          <p><span className="font-semibold">Tổng chi tiêu:</span> 15.200.000₫</p>
          <p><span className="font-semibold">Trạng thái:</span> <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Hoạt động</span></p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8-8-3.59-8-8zm13 1h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>
          <span>Hủy bỏ</span>
        </button>
        <button className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors">
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
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
            <span>Gửi email</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-200 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"></path></svg>
            <span>Tạm khóa tài khoản</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2zm-2 4H7v-2h10v2zm0-8H7V7h10v2z"></path></svg>
            <span>Tặng voucher</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerEdit;