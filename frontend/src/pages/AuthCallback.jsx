import { AuthContext } from "@/context/Authcontext"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function GoogleCallback() {
    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get("token")
        const userString = params.get("user")

        if (token && userString) {
            try {
                const user = JSON.parse(userString)
                localStorage.setItem("accessToken", token)
                localStorage.setItem("user", JSON.stringify(user)) 
                login(user)
                toast.success("Đăng nhập thành công")
                navigate("/")
            } catch (err) {
                toast.error("Lỗi parse user:", err)
            }
        } else {
            toast.warn("Thiếu token hoặc user từ Google callback")
        }
    }, [navigate])

    return <div>Đang xử lý đăng nhập Google...</div>
}


