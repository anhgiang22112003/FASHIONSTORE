import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "@/service/api"
import { toast } from "react-toastify"
import { CartContext } from "@/context/CartContext"
import AddproductSearch from "@/components/fashion/AddProductSearch"
const Checkout = () => {
  const navigate = useNavigate()
  const { cart, fetchCart } = useContext(CartContext)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [voucherCode, setVoucherCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [isVoucherPopupOpen, setIsVoucherPopupOpen] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [shippingMethod, setShippingMethod] = useState("standard")

  const shippingOptions = [
    { id: "standard", name: "Giao hàng tiêu chuẩn", price: 30000 },
    { id: "express", name: "Giao hàng nhanh", price: 50000 },
  ]
  const openVoucherPopup = async () => {
    try {
      setIsVoucherPopupOpen(true)
      const res = await api.get("/vouchers/available") // 🔥 API này bạn cần tạo ở backend
      setAvailableVouchers(res.data)
    } catch (err) {
      toast.error("Không thể tải danh sách voucher")
    }
  }
  const handleSelectVoucher = async (code) => {
    setVoucherCode(code)
    setIsVoucherPopupOpen(false)
    try {
      setIsApplying(true)
      const res = await api.post("/vouchers/apply-voucher", { code: code })
      toast.success(res.data.message || "Áp dụng mã giảm giá thành công 🎉")
      fetchCart() // Cập nhật lại giỏ hàng
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mã giảm giá không hợp lệ")
    } finally {
      setIsApplying(false)
    }
  }

  const [form, setForm] = useState({
    name: cart?.user?.name || "",
    phone: cart?.user?.phone || "",
    email: cart?.user?.email || "",
    address: cart?.user?.address || "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    paymentMethod: "COD",
  })

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => setProvinces(data))
  }, [])

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      fetchCart()
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    try {
      await api.patch(`/cart/update/${itemId}`, { quantity: newQuantity })
      fetchCart()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại')
    }
  }
  useEffect(() => {
    if (provinces.length > 0 && cart?.user?.province) {
      // Tìm Mã Tỉnh/Thành phố dựa trên TÊN đã lưu
      const savedProvince = provinces.find(p => p.name === cart.user.province)
      const provinceCode = savedProvince?.code || ""

      // Tìm Mã Quận/Huyện dựa trên TÊN đã lưu
      const savedDistrict = savedProvince?.districts.find(d => d.name === cart.user.district)
      const districtCode = savedDistrict?.code || ""

      // Tìm Mã Phường/Xã dựa trên TÊN đã lưu
      const savedWard = savedDistrict?.wards.find(w => w.name === cart.user.ward)
      const wardCode = savedWard?.code || ""

      // Cập nhật form state bằng các mã code vừa tìm được
      setForm(prevForm => ({
        ...prevForm,
        name: cart.user.name || prevForm.name,
        phone: cart.user.phone || prevForm.phone,
        email: cart.user.email || prevForm.email,
        address: cart.user.address || prevForm.address,
        provinceCode: provinceCode,
        districtCode: districtCode,
        wardCode: wardCode,
      }))
      // Tự động load danh sách Quận/Huyện và Phường/Xã cho lần render đầu
      if (provinceCode) {
        setDistricts(savedProvince.districts || [])
        if (districtCode) {
          setWards(savedDistrict.wards || [])
        }
      }
    }
  }, [cart, provinces])

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    const selectedProvince = provinces.find(p => p.code == provinceCode)

    setDistricts(selectedProvince?.districts || [])
    setWards([])

    setForm(prevForm => ({
      ...prevForm,
      provinceCode: provinceCode, // Cập nhật đúng key
      districtCode: "",
      wardCode: "",
    }))
  }

  const handleWardChange = (e) => {
    const wardCode = e.target.value

    // Cập nhật Form State
    setForm(prevForm => ({
      ...prevForm,
      wardCode: wardCode, // Cập nhật đúng key
    }))
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  useEffect(() => {
    if (cart?.user) {
      setForm(prevForm => ({
        ...prevForm,
        name: cart?.user?.name || prevForm.name,
        phone: cart?.user?.phone || prevForm.phone,
        email: cart?.user?.email || prevForm.email,
        address: cart?.user?.address || prevForm.address,
        provinceCode: cart?.user?.province || prevForm.province,
        districtCode: cart?.user?.district || prevForm.district,
        wardCode: cart?.user?.ward || prevForm.ward,
      }))
    }
  }, [cart])

  const handleDistrictChange = (e) => {
    const district = e.target.value
    const selectedDistrict = districts.find(d => d.code == district)
    setWards(selectedDistrict?.wards || [])
    setForm(prevForm => ({
      ...prevForm,
      districtCode: district,
      wardCode: "", // Reset Phường/Xã
    }))
  }
  const handlePaymentChange = (method) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }))
  }
  const fullAddress = `${form.address}, ${form.wardCode || ""}, ${form.districtCode || ""}, ${form.provinceCode || ""}`.replace(/,\s*,/g, ",")

  const handleOrder = async () => {
    if (!form.address) {
      toast.warning("Vui lòng nhập địa chỉ giao hàng")
      return
    }

    try {
      const res = await api.post("/orders", {
        address: fullAddress,
        paymentMethod: form.paymentMethod,
      })

      toast.success("Đặt hàng thành công 🎉")
      navigate("/orders/" + res.data._id)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đặt hàng thất bại")
    }
  }

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.warning("Vui lòng nhập mã giảm giá")
      return
    }
    try {
      setIsApplying(true)
      const res = await api.post("/vouchers/apply-voucher", { code: voucherCode })
      toast.success(res.data.message || "Áp dụng mã giảm giá thành công 🎉")
      fetchCart() // Cập nhật lại giỏ hàng
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mã giảm giá không hợp lệ")
    } finally {
      setIsApplying(false)
    }
  }

  if (!cart) {
    return <p className="text-center text-gray-600 mt-10">Không có sản phẩm trong giỏ hàng</p>
  }
  return (
    <div className="min-h-screen w-full bg-gray-100 p-8 font-sans flex items-center justify-center">
      <div className="w-full  bg-white rounded-none lg:rounded-lg shadow-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8 min-h-screen">

        {/* Bên trái: Thông tin giao hàng */}
        <div className="flex-1 space-y-8 overflow-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Thông tin giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Nhập họ và tên" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="Nhập số điện thoại" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input name="address" type="text" value={form.email} onChange={handleChange} placeholder="Nhập địa chỉ giao hàng (Số nhà, tên đường...)" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
              <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ giao hàng (Số nhà, tên đường...)" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select onChange={handleProvinceChange} value={form.provinceCode} className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quận/Huyện</label>
                <select onChange={handleDistrictChange} value={form.districtCode} className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option value="">Chọn quận/huyện</option>
                  {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phường/Xã</label>
                <select onChange={handleWardChange} value={form.wardCode} className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option value="">Chọn phường/xã</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4 bg-white rounded-xl">
            <h3 className="text-2xl font-bold text-gray-800 font-semibold mb-2">Phương thức vận chuyển</h3>
            {shippingOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 py-1">
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  checked={shippingMethod === option.id}
                  onChange={() => setShippingMethod(option.id)}
                />
                <span>{option.name} — {option.price.toLocaleString()}đ</span>
              </label>
            ))}
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Phương thức thanh toán</h2>

            <div className="space-y-4">
              {/* COD */}
              <div
                onClick={() => handlePaymentChange("COD")}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === "COD" ? "border-pink-500 bg-pink-50" : "border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="cod"
                  checked={form.paymentMethod === "COD"}
                  onChange={() => handlePaymentChange("COD")}
                  className="w-5 h-5 appearance-none border border-gray-400 rounded-full cursor-pointer checked:border-pink-500 checked:bg-white"
                />
                <label htmlFor="cod" className="ml-3 font-bold text-gray-800 cursor-pointer">
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>

              {/* Bank transfer */}
              <div
                onClick={() => handlePaymentChange("BANK")}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === "BANK" ? "border-pink-500 bg-pink-50" : "border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="bank"
                  checked={form.paymentMethod === "BANK"}
                  onChange={() => handlePaymentChange("BANK")}
                  className="w-5 h-5 appearance-none border border-gray-400 rounded-full cursor-pointer checked:border-pink-500 checked:bg-white"
                />
                <label htmlFor="bank" className="ml-3 text-gray-600 cursor-pointer">
                  Chuyển khoản ngân hàng
                </label>
              </div>

              {/* MoMo */}
              <div
                onClick={() => handlePaymentChange("MOMO")}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === "MOMO" ? "border-pink-500 bg-pink-50" : "border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="momo"
                  checked={form.paymentMethod === "MOMO"}
                  onChange={() => handlePaymentChange("MOMO")}
                  className="w-5 h-5 appearance-none border border-gray-400 rounded-full cursor-pointer checked:border-pink-500 checked:bg-white"
                />
                <label htmlFor="momo" className="ml-3 text-gray-600 cursor-pointer">
                  Ví điện tử MoMo
                </label>
              </div>
            </div>

            <button
              onClick={handleOrder}
              className="mt-6 w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition"
            >
              Đặt hàng
            </button>
          </div>
        </div>

        {/* Bên phải: Đơn hàng */}
        <div className="flex-1 bg-pink-100  lg:rounded-lg lg:p-8 space-y-6 overflow-auto">
          <h2 className="text-2xl font-bold text-gray-800 ">Đơn hàng của bạn</h2>

          <AddproductSearch />

          {/* Danh sách sản phẩm */}
          {cart?.items?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Ảnh sản phẩm */}
                <img
                  src={item?.product?.mainImage || "/placeholder.png"}
                  alt={item?.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div>
                  <p className="font-semibold text-gray-800">{item?.product?.name}</p>
                  <p className="text-sm text-gray-500">
                    Size: {item?.size} | Màu: {item?.color}
                  </p>
                  <p className="text-pink-600 font-semibold mt-1">
                    {item?.product?.originalPrice?.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>

              {/* Tăng giảm số lượng */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item?._id, item?.quantity - 1)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  -
                </button>
                <span className="min-w-[20px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item?._id, item?.quantity + 1)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mã giảm giá
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã giảm giá..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={applyVoucher}
                  disabled={isApplying}
                  className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {isApplying ? "Đang áp dụng..." : "Áp dụng"}
                </button>
                <button
                  onClick={openVoucherPopup}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                >
                  🎟 Chọn voucher
                </button>
              </div>

            </div>
          </div>
          {/* Tổng kết */}
          <div className="space-y-4 pt-6 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Tạm tính:</p>
              <p className="font-medium text-gray-800">
                {cart?.subtotal?.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Giảm giá:</p>
              <p className="font-medium text-green-600">
                -{cart?.discount?.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Phí vận chuyển:</p>
              <p className="font-medium text-gray-800">
                {cart?.shipping?.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="flex justify-between items-center text-xl font-bold pt-4 border-t-2 border-dashed border-gray-300">
              <p className="text-gray-800">Tổng cộng:</p>
              <p className="text-pink-600">
                {cart?.total?.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>

          <button
            onClick={handleOrder}
            className="w-full py-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors duration-300"
          >
            Hoàn tất đặt hàng
          </button>
        </div>


      </div>
      {isVoucherPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">🎁 Voucher của bạn</h2>
            <button
              onClick={() => setIsVoucherPopupOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            {availableVouchers.length === 0 ? (
              <p className="text-gray-500 text-center">Bạn chưa có voucher nào khả dụng 😢</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {availableVouchers.map((v) => (
                  <li
                    key={v.code}
                    className="border border-gray-300 rounded-lg p-4 hover:border-pink-400 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{v.name}</p>
                        <p className="text-sm text-gray-600">
                          Mã: <span className="font-mono">{v.code}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {v.type === "percent"
                            ? `Giảm ${v.discountValue}%`
                            : v.type === "amount"
                              ? `Giảm ${v.discountValue.toLocaleString()}đ`
                              : "Miễn phí vận chuyển"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectVoucher(v.code)}
                        className="bg-pink-600 text-white px-3 py-1 rounded-lg hover:bg-pink-700"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Checkout
