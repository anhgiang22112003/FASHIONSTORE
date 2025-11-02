import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "@/service/api"
import { toast } from "react-toastify"
import { CartContext } from "@/context/CartContext"
import AddproductSearch from "@/components/fashion/AddProductSearch"
const ShippingMethodEnum = {
  STANDARD: 'NHANH',
  EXPRESS: 'HOA_TOC',
}
const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const buyNowData = location.state
  const { cart, fetchCart, setCart } = useContext(CartContext)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [voucherCode, setVoucherCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [isVoucherPopupOpen, setIsVoucherPopupOpen] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [buyNowDiscountAmount, setBuyNowDiscountAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [form, setForm] = useState({
    name: cart?.user?.name || "",
    phone: cart?.user?.phone || "",
    email: cart?.user?.email || "",
    address: cart?.user?.address || "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    paymentMethod: "COD",
    note: "",
  })

  const shippingOptions = [
    { id: "standard", name: "Giao hàng tiêu chuẩn", price: 30000, backendValue: ShippingMethodEnum.STANDARD },
    { id: "express", name: "Giao hàng hỏa tốc (HOA_TOC)", price: 50000, backendValue: ShippingMethodEnum.EXPRESS },
  ]
  useEffect(() => {
    fetchCart()
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])



  useEffect(() => {
    // Nếu chưa có dữ liệu user hoặc tỉnh thì đợi
    if (!cart?.user || provinces.length === 0) return

    // Tự động fill dữ liệu khi có user lần đầu
    const savedProvince = provinces.find(p => p.name === cart.user.province)
    const savedDistrict = savedProvince?.districts.find(d => d.name === cart.user.district)
    const savedWard = savedDistrict?.wards.find(w => w.name === cart.user.ward)

    setForm({
      name: cart.user.name || "",
      phone: cart.user.phone || "",
      email: cart.user.email || "",
      address: cart.user.address || "",
      provinceCode: savedProvince?.code || "",
      districtCode: savedDistrict?.code || "",
      wardCode: savedWard?.code || "",
      paymentMethod: "COD",
      note: "",
    })

    setDistricts(savedProvince?.districts || [])
    setWards(savedDistrict?.wards || [])

    setIsFormInitialized(true)
  }, [cart?.user, provinces])


  const openVoucherPopup = async () => {
    try {
      setIsVoucherPopupOpen(true)
      const res = await api.get("/vouchers/available")
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
      const res = await api.post("/vouchers/apply-voucher", {
        code,
        ...(buyNowData?.mode === "buyNow" ? {
          product: buyNowData.product,
          quantity: buyNowData.quantity,
          basePrice: buyNowData.product.originalPrice,
        } : {})
      })

      if (isBuyNow) {
        setBuyNowDiscountAmount(res.data.discount || 0)
      } else {
        const shippingFee = shippingMethod === "express" ? 50000 : 30000
        const subtotal = cart?.subtotal || 0
        const discount = res.data.discount || 0
        const newTotal = subtotal - discount + shippingFee

        setCart(prev => ({
          ...prev,
          voucherCode: res.data.code,
          discount: discount,
          total: newTotal,
          shipping: shippingFee,
        }))
      }

      toast.success(res.data.message || "Áp dụng mã giảm giá thành công 🎉")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mã giảm giá không hợp lệ")
    } finally {
      setIsApplying(false)
    }
  }

  // 🧮 Tính tạm tính và tổng cộng cho chế độ "Mua ngay"
  const isBuyNow = buyNowData?.mode === "buyNow"

  const buyNowSubtotal = isBuyNow
    ? (buyNowData.product?.sellingPrice || 0) * (buyNowData.quantity || 1)
    : cart?.subtotal || 0

  const shippingFee = shippingMethod === "express" ? 50000 : 30000
  const buyNowTotal = buyNowSubtotal - (buyNowData ? buyNowDiscountAmount : cart.discount) + shippingFee


  useEffect(() => {
    const newShippingFee = shippingMethod === "express" ? 50000 : 30000
    const subtotal = cart?.subtotal || 0
    const discount = cart?.discount || 0
    const newTotal = subtotal - discount + newShippingFee

    setCart(prev => ({
      ...prev,
      shipping: newShippingFee,
      total: newTotal,
    }))
  }, [shippingMethod, cart?.discount, cart?.subtotal])

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

  const handleDistrictChange = (e) => {
    const district = e.target.value
    const selectedDistrict = districts.find(d => d.code == district)
    setWards(selectedDistrict?.wards || [])
    setForm(prevForm => ({
      ...prevForm,
      districtCode: district,
      wardCode: "",
    }))
  }
  const handlePaymentChange = (method) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }))
  }
  const handleBankPayment = async (invoiceNumber, totalAmount) => {
    try {
      const res = await api.post("/sepay-webhook/create-payment", {
        invoiceNumber,
        amount: totalAmount,
        description: `Thanh toán đơn hàng ${invoiceNumber}`,
      })

      const { checkoutURL, formFields } = res.data

      // Tạo form và submit tự động
      const formEl = document.createElement("form")
      formEl.action = checkoutURL
      formEl.method = "POST"
      Object.keys(formFields).forEach(key => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = formFields[key]
        formEl.appendChild(input)
      })
      document.body.appendChild(formEl)
      formEl.submit()
    } catch (err) {
      toast.error("Tạo thanh toán thất bại")
      console.error(err)
    }
  }


  const handleOrder = async () => {
    if (!form.address || !form.provinceCode || !form.districtCode || !form.wardCode) {
      toast.warning("Vui lòng nhập đầy đủ địa chỉ giao hàng (Số nhà, Tỉnh/Thành, Quận/Huyện, Phường/Xã)")
      return
    }
    const provinceName = provinces.find(p => p.code == form.provinceCode)?.name || ""
    const districtName = districts.find(d => d.code == form.districtCode)?.name || ""
    const wardName = wards.find(w => w.code == form.wardCode)?.name || ""
    const fullAddress = `${form.address}, ${wardName}, ${districtName}, ${provinceName}`.replace(/,\s*,/g, ", ")
    const selectedShippingOption = shippingOptions.find(opt => opt.id === shippingMethod)
    const backendShippingMethod = selectedShippingOption ? selectedShippingOption.backendValue : ShippingMethodEnum.NHANH
    try {
      // Dữ liệu gửi lên server
      let res

      if (buyNowData?.mode === "buyNow") {
        res = await api.post("/orders/buy-now", {
          productId: buyNowData.product._id,
          quantity: buyNowData.quantity,
          color: buyNowData.color,
          size: buyNowData.size,
          address: fullAddress,
          paymentMethod: form.paymentMethod,
          shippingMethod: backendShippingMethod,
          voucherCode: voucherCode,
          discount:buyNowDiscountAmount,
          note: form.note,
          shippingInfo: {
            name: form.name,
            phone: form.phone,
            address: fullAddress,
          },
        })
      } else {
        res = await api.post("/orders", {
          address: fullAddress,
          paymentMethod: form.paymentMethod,
          shippingMethod: backendShippingMethod,
          voucherCode: cart.voucherCode,
          note: form.note,
          shippingInfo: {
            name: form.name,
            phone: form.phone,
            address: fullAddress,
          },
        })
      }
      const invoiceNumber = res.data._id
      const total = res.data.total
      if (form.paymentMethod === "BANK") {
        await handleBankPayment(invoiceNumber, total)
        fetchCart()
      } else {
        fetchCart()
        toast.success("Đặt hàng thành công 🎉")
        navigate("/orders")
      }
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
      const res = await api.post("/vouchers/apply-voucher", {
        code: voucherCode,
        ...(buyNowData?.mode === "buyNow" ? {
          product: buyNowData.product,
          quantity: buyNowData.quantity,
          basePrice: buyNowData.product.originalPrice,
        } : {})

      })
      if (isBuyNow) {
        setBuyNowDiscountAmount(res.data.discount || 0)
      }
      toast.success(res.data.message || "Áp dụng mã giảm giá thành công 🎉")
      fetchCart() // Cập nhật lại giỏ hàng
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mã giảm giá không hợp lệ")
    } finally {
      setIsApplying(false)
    }
  }

  const displayShippingFee = cart?.shipping ?? (
    shippingMethod === "express" ? 50000 : 30000
  )

  if (!cart) {
    return <p className="text-center text-gray-600 mt-10">Không có sản phẩm trong giỏ hàng</p>
  }
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen w-full bg-gray-100  p-8 font-sans flex items-center justify-center">
      <div className="w-full  bg-white rounded-none lg:rounded-lg shadow-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8">

        {/* Bên trái: Thông tin giao hàng */}
        <div className="flex-1 space-y-8 overflow-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">Thông tin giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Nhập họ và tên" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="Nhập số điện thoại" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Nhập email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>

            {/* Địa chỉ chi tiết */}
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
                <select onChange={handleDistrictChange} value={form.districtCode} className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300" disabled={districts.length === 0}>
                  <option value="">Chọn quận/huyện</option>
                  {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phường/Xã</label>
                <select onChange={handleWardChange} value={form.wardCode} className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300" disabled={wards.length === 0}>
                  <option value="">Chọn phường/xã</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số nhà, tên đường</label>
              <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="Số nhà, tên đường, thôn xóm..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>

            {/* 🔥 TRƯỜNG GHI CHÚ (NOTE) MỚI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú cho đơn hàng (Tùy chọn)</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Ví dụ: Giao hàng vào buổi tối, gọi điện trước khi giao..."
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
            </div>

          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">Phương thức vận chuyển</h3>
            <div className="space-y-2">
              {shippingOptions.map((option) => (
                <label key={option.id} className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition ${shippingMethod === option.id ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={shippingMethod === option.id}
                      onChange={() => setShippingMethod(option.id)}
                      className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                    />
                    <span className="font-semibold text-gray-700">{option.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{option.price.toLocaleString("vi-VN")}₫</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Phương thức thanh toán</h2>
            <div className="space-y-4">
              {/* COD */}
              <div
                onClick={() => handlePaymentChange("COD")}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === "COD" ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="cod"
                  checked={form.paymentMethod === "COD"}
                  onChange={() => handlePaymentChange("COD")}
                  className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                />
                <label htmlFor="cod" className="ml-3 font-bold text-gray-800 cursor-pointer">
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>

              {/* Bank transfer */}
              <div
                onClick={() => handlePaymentChange("BANK")}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === "BANK" ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="bank"
                  checked={form.paymentMethod === "BANK"}
                  onChange={() => handlePaymentChange("BANK")}
                  className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                />
                <label htmlFor="bank" className="ml-3 font-bold text-gray-800 cursor-pointer">
                  Chuyển khoản ngân hàng
                </label>
              </div>

              {/* MoMo */}
              <div
                onClick={() => handlePaymentChange("MOMO")}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition ${form.paymentMethod === "MOMO" ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  id="momo"
                  checked={form.paymentMethod === "MOMO"}
                  onChange={() => handlePaymentChange("MOMO")}
                  className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                />
                <label htmlFor="momo" className="ml-3 font-bold text-gray-800 cursor-pointer">
                  Ví điện tử MoMo
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bên phải: Đơn hàng & Tổng kết */}
        <div className="flex-1 flex-shrink-0 bg-pink-50 rounded-2xl p-6 lg:p-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">Đơn hàng của bạn</h2>

          <AddproductSearch />

          {/* Danh sách sản phẩm */}
          <div className="space-y-4 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2">
            {buyNowData?.mode === "buyNow" ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={buyNowData?.product?.mainImage || "placeholder.png"}
                    alt={buyNowData?.product?.name}
                    className="w-14 h-14 rounded-lg object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{buyNowData?.product?.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {buyNowData?.size} | Màu: {buyNowData?.color}
                    </p>
                    <p className="text-pink-600 font-semibold mt-1">
                      {buyNowData?.product?.sellingPrice?.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[20px] text-center font-medium">{buyNowData?.quantity}</span>
                </div>
              </div>
            ) : (
              cart?.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <img
                      src={item?.product?.mainImage || "placeholder.png"}
                      alt={item?.product?.name}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item?.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {item?.size} | Màu: {item?.color}
                      </p>
                      <p className="text-pink-600 font-semibold mt-1">
                        {item?.product?.sellingPrice?.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item?._id, item?.quantity - 1)}
                      className="p-1 border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="min-w-[20px] text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item?._id, item?.quantity + 1)}
                      className="p-1 border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mã giảm giá */}
          <div className="space-y-2 pt-4 border-t border-gray-300">
            <label className="block text-sm font-semibold text-gray-700">Mã giảm giá</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã giảm giá..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none"
              />
              <button
                onClick={applyVoucher}
                disabled={isApplying}
                className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
              >
                {isApplying ? "..." : "Áp dụng"}
              </button>
            </div>
            <button
              onClick={openVoucherPopup}
              className="w-full text-center text-sm text-pink-600 font-medium hover:text-pink-700 mt-2"
            >
              🎟 Chọn từ voucher có sẵn
            </button>
          </div>

          {/* Tổng kết */}
          <div className="space-y-4 pt-6 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Tạm tính:</p>
              <p className="font-medium text-gray-800">
                {buyNowSubtotal.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Giảm giá:</p>
              <p className="font-medium text-green-600">
                -{buyNowData ? buyNowDiscountAmount.toLocaleString("vi-VN") : cart?.discount?.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Phí vận chuyển ({shippingOptions.find(opt => opt.id === shippingMethod)?.name}):
              </p>
              <p className="font-medium text-gray-800">
                {buyNowData ? shippingFee.toLocaleString("vi-VN") : displayShippingFee.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="flex justify-between items-center text-xl font-bold pt-4 border-t-2 border-dashed border-pink-300">
              <p className="text-gray-800">Tổng cộng:</p>
              <p className="text-pink-600">
                {buyNowData ? buyNowTotal.toLocaleString("vi-VN") : buyNowTotal.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>


          <button
            onClick={handleOrder}
            className="w-full py-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors duration-300 shadow-lg shadow-pink-200/50"
          >
            Hoàn tất đặt hàng
          </button>
        </div>


        {/* Popup Voucher */}
        {isVoucherPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <h2 className="text-2xl font-bold mb-4 text-pink-600">🎁 Voucher của bạn</h2>
              <button
                onClick={() => setIsVoucherPopupOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              {availableVouchers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Bạn chưa có voucher nào khả dụng 😢</p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {availableVouchers.map((v) => (
                    <li
                      key={v.code}
                      className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-pink-500 transition-all"
                    >
                      <div>
                        <p className="font-bold text-lg text-gray-800">{v.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Mã: <span className="font-mono text-pink-600 font-semibold">{v.code}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {v.type === "percent"
                            ? `Giảm ${v.discountValue}%`
                            : v.type === "amount"
                              ? `Giảm ${v.discountValue.toLocaleString()}₫`
                              : "Miễn phí vận chuyển"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectVoucher(v.code)}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
                      >
                        Áp dụng
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Checkout
