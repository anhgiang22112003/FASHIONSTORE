
import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import api from "@/service/api"

const ResetPassword = () => {
    const { token } = useParams() // Token từ URL (vd: /reset-password/:token)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!password || !confirmPassword)
            return toast.error("Vui lòng nhập đầy đủ thông tin!")
        if (password !== confirmPassword)
            return toast.error("Mật khẩu xác nhận không khớp!")

        setLoading(true)
        try {
            await api.post(`/auth/reset-password`, {
                token,
                newPassword: password,
            })
            toast.success(res.data.message || "Đặt lại mật khẩu thành công!")
            navigate("/login")
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-4">Đặt lại mật khẩu</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
