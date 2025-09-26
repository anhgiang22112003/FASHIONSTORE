// AuthPage.jsx
import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleGoogleLogin = () => {
    // TODO: Thêm logic đăng nhập Google ở đây
    alert("Đăng nhập bằng Google");
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center p-8 gap-12 min-h-screen bg-pink-50">
      {/* Register */}
      {!isLogin && (
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-pink-600">PinkFashion</h1>
            <h2 className="text-2xl font-bold text-gray-800">Đăng ký</h2>
            <p className="text-gray-500 text-sm">
              Tạo tài khoản mới để bắt đầu mua sắm
            </p>
          </div>

          <div className="space-y-4">
            <InputField id="reg-name" type="text" label="Họ và tên" placeholder="Nhập họ và tên" icon="user" />
            <InputField id="reg-email" type="email" label="Email" placeholder="Nhập địa chỉ email" icon="mail" />
            <InputField id="reg-phone" type="tel" label="Số điện thoại" placeholder="Nhập số điện thoại" icon="phone" />
            <InputField id="reg-password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" icon="lock" />
            <InputField id="reg-confirm-password" type="password" label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" icon="lock" />
          </div>

          <div className="flex items-center text-sm">
            <input
              type="checkbox"
              id="terms"
              className="form-checkbox text-pink-500 rounded border-gray-300 focus:ring-pink-400"
            />
            <label htmlFor="terms" className="ml-2 text-gray-600">
              Tôi đồng ý với{" "}
              <a href="#" className="text-pink-600 font-medium">Điều khoản sử dụng</a> và{" "}
              <a href="#" className="text-pink-600 font-medium">Chính sách bảo mật</a>
            </label>
          </div>

          <button className="w-full py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors">
            Đăng ký
          </button>

          <p className="text-center text-gray-600 text-sm mt-4">
            Đã có tài khoản?{" "}
            <span
              className="text-pink-600 font-semibold cursor-pointer"
              onClick={() => setIsLogin(true)}
            >
              Đăng nhập ngay
            </span>
          </p>
        </div>
      )}

      {/* Login */}
      {isLogin && (
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-pink-600">PinkFashion</h1>
            <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
            <p className="text-gray-500 text-sm">Chào mừng bạn quay trở lại!</p>
          </div>

          <div className="space-y-4">
            <InputField id="login-email" type="text" label="Email hoặc tên đăng nhập" placeholder="Nhập email hoặc tên đăng nhập" icon="mail" />
            <InputField id="login-password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" icon="lock" />
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="form-checkbox text-pink-500 rounded border-gray-300 focus:ring-pink-400"
              />
              <label htmlFor="remember" className="ml-2 text-gray-600">Ghi nhớ đăng nhập</label>
            </div>
            <a href="#" className="text-pink-600 font-medium">Quên mật khẩu?</a>
          </div>

          <button className="w-full py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors">
            Đăng nhập
          </button>

          <p className="text-center text-gray-600 text-sm">
            Chưa có tài khoản?{" "}
            <span
              className="text-pink-600 font-semibold cursor-pointer"
              onClick={() => setIsLogin(false)}
            >
              Đăng ký ngay
            </span>
          </p>

          {/* Hoặc đăng nhập bằng Google */}
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">Hoặc đăng nhập bằng</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3">
              <path
                d="M533.5 278.4c0-17.7-1.5-34.7-4.3-51.2H272v96.9h146.9c-6.4 34.9-25.6 64.5-54.8 84.3v69.9h88.7c51.9-47.9 81.7-118 81.7-200z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c73.2 0 134.6-24.2 179.5-65.7l-88.7-69.9c-24.6 16.5-56 26.2-90.8 26.2-69.8 0-129-47.1-150.1-110.1H31.3v69.1C76.3 489.5 169.3 544.3 272 544.3z"
                fill="#34A853"
              />
              <path
                d="M121.9 320.8c-4.5-13.3-7.1-27.4-7.1-42s2.6-28.7 7.1-42V167.7H31.3c-14.6 28.5-23 60.7-23 95.1s8.4 66.6 23 95.1l90.6-36.1z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.7c39.7 0 75.3 13.7 103.3 40.7l77.5-77.5C405.9 25.1 344.5 0 272 0 169.3 0 76.3 54.8 31.3 137.4l90.6 69.1c21.1-63 80.3-110.8 150.1-110.8z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable input field component
function InputField({ id, type, label, placeholder, icon }) {
  const icons = {
    user: (
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
    ),
    mail: (
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    ),
    phone: (
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.66l1.37 4.11a2 2 0 01-.5 2.15l-3.32 3.32a15 15 0 0011.62 11.62l3.32-3.32a2 2 0 012.15-.5l4.11 1.37a1 1 0 01.66.95V19a2 2 0 01-2 2h-1C9.69 21 3 14.31 3 6V5z"></path>
      </svg>
    ),
    lock: (
      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm0-10V7a4 4 0 018 0v4m-8 0h8"></path>
      </svg>
    )
  };

  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        {icons[icon]}
      </div>
    </div>
  );
}
