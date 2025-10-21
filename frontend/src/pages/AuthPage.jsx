// AuthPage.jsx
import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../service/api"
import { AuthContext } from "@/context/Authcontext"
import { set } from "date-fns"

export default function AuthPage() {
  const { login } = useContext(AuthContext)

  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  // Xử lý nhập dữ liệu
  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))

    // Clear error khi user nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = "Vui lòng nhập họ và tên"
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Vui lòng nhập số điện thoại"
      } else if (!/^\d{10,11}$/.test(formData.phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      if (isLogin) {
        const res = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        })        
        if (res?.status === 201) {
          localStorage.setItem("accessToken", res?.data?.accessToken)
          localStorage.setItem("user", JSON.stringify(res?.data?.user))
          login(res.data.user) // ✅ Cập nhật context

          toast.success("Đăng nhập thành công 🎉")
          navigate("/")
        }
      } else {
        const res = await api.post("/auth/register", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        })

        if (res?.status === 201) {
          localStorage.setItem("accessToken", res?.data?.accessToken)
          toast.success("Đăng ký thành công 🎉")
          // navigate("/login")
          setIsLogin(true)
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center p-8 gap-12 min-h-screen bg-pink-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-pink-600">PinkFashion</h1>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? "Chào mừng bạn quay trở lại!" : "Tạo tài khoản mới để bắt đầu mua sắm"}
          </p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <>
              <InputField
                id="name"
                type="text"
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                icon="user"
                value={formData.name}
                onChange={handleInputChange("name")}
                error={errors.name}
              />
              <InputField
                id="phone"
                type="tel"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                icon="phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                error={errors.phone}
              />
            </>
          )}
          <InputField
            id="email"
            type="email"
            label="Email"
            placeholder="Nhập email"
            icon="mail"
            value={formData.email}
            onChange={handleInputChange("email")}
            error={errors.email}
          />
          <InputField
            id="password"
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            icon="lock"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={errors.password}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors"
        >
          {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
        </button>

        <p className="text-center text-gray-600 text-sm">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <span
            className="text-pink-600 font-semibold cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
          </span>
          <Link to="/forgot-password">
            <p className="text-pink-600 font-semibold cursor-pointer">
              {isLogin ? "Quên mật khẩu" : ""}{" "}

            </p>
          </Link>
        </p>

      </form>
    </div>
  )
}

// Reusable InputField
function InputField({ id, type, label, placeholder, icon, value, onChange, error }) {
  const icons = {
    user: "👤",
    mail: "📧",
    phone: "📞",
    lock: "🔒",
  }

  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none ${error ? "border-red-500" : "border-pink-300 focus:ring-2 focus:ring-pink-200"
            }`}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icons[icon]}
        </span>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
