import apiAdmin from '@/service/apiAdmin'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'react-toastify'

const AdminLoginForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {            
            const res = await apiAdmin.post("/auth/login-admin", { email, password })                        
            sessionStorage.setItem("accessToken", res?.data?.accessToken)
            sessionStorage.setItem("user", JSON.stringify(res.data.user))
            toast.success("Đăng nhập thành công!")
            navigate("/admin")
        } catch (err) {
            toast.error(err.response?.data?.message || "Đăng nhập thất bại")
        }
    }

    return (
        // Thêm ảnh nền và lớp phủ màu hồng nhạt
        <div
            className="flex items-center justify-center min-h-screen"
            style={{
                backgroundImage: "url('https://tse4.mm.bing.net/th/id/OIP.0Nq-Bh10gbvxCVf0i5IJ4gAAAA?pid=Api&P=0&h=220')", // **Thay thế bằng URL ảnh của bạn**
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Lớp phủ mờ màu hồng để tạo tông chủ đạo và làm nổi bật form */}
            <div className="absolute inset-0 bg-pink-100/80 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full max-w-sm p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-pink-200">

                {/* Logo/Tên thương hiệu */}
                <div className="text-center mb-10">
                    {/* Hình ảnh logo nhỏ (tùy chọn) */}
                    {/* **Thay thế bằng URL logo thực tế của bạn** */}


                    <h1 className="text-4xl font-extrabold text-pink-600">
                        PinkFashion
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg font-medium">
                        Cổng Quản Trị
                    </p>
                    <p className="text-gray-500 mt-1">  
                        Chào mừng bạn quay trở lại!
                    </p>
                </div>

                {/* Form Đăng nhập */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Trường Email */}
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" Nhập email"
                                required
                                // Điều chỉnh border và focus ring sang màu hồng
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/70 transition duration-150 pl-10 text-gray-800"
                            />
                            {/* Icon Email */}
                            <Mail className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-pink-500" />
                        </div>
                    </div>

                    {/* Trường Mật khẩu */}
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" Nhập mật khẩu"
                                required
                                // Điều chỉnh border và focus ring sang màu hồng
                                className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/70 transition duration-150 pl-10 text-gray-800"
                            />
                            {/* Icon khóa */}
                            <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-pink-500" />
                        </div>
                    </div>

                    {/* Nút Đăng nhập */}
                    <button
                        type="submit"
                        // Màu sắc nút nổi bật hơn
                        className="w-full py-3 bg-pink-600 text-white font-semibold rounded-lg shadow-xl hover:bg-pink-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-pink-100"
                    >
                        Đăng nhập Quản Trị
                    </button>
                </form>

                {/* Đăng ký - có thể ẩn trong trang admin login thực tế */}
                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        Quên mật khẩu?
                        <a href="/reset-password" className="text-pink-600 hover:text-pink-700 font-medium ml-1">
                            Lấy lại tại đây
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminLoginForm