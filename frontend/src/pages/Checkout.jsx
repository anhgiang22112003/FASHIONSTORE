import React, { useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "@/service/api"
import { toast } from "react-toastify"
import { CartContext } from "@/context/CartContext"
import AddproductSearch from "@/components/fashion/AddProductSearch"
import BankPaymentModal from "@/components/BankPaymentSection"
import VoucherSection from "@/components/VoucherSection"
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck, 
  Plus, 
  Minus, 
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
  Package,
  User,
  Phone,
  Mail,
  MapPinned
} from "lucide-react"

const ShippingMethodEnum = {
  STANDARD: 'NHANH',
  EXPRESS: 'HOA_TOC',
}

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showBankModal, setShowBankModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)
  const [orderData, setOrderData] = useState(null)

  const buyNowData = location.state
  const { cart, fetchCart, setCart } = useContext(CartContext)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [voucherCode, setVoucherCode] = useState("")
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

  const shippingOptions = useMemo(() => [
    { 
      id: "standard", 
      name: "Giao hàng tiêu chuẩn", 
      price: 30000, 
      backendValue: ShippingMethodEnum.STANDARD,
      icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
      time: "3-5 ngày",
      description: "Giao hàng trong giờ hành chính"
    },
    { 
      id: "express", 
      name: "Giao hàng hỏa tốc", 
      price: 50000, 
      backendValue: ShippingMethodEnum.EXPRESS,
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
      time: "1-2 ngày",
      description: "Ưu tiên giao nhanh nhất"
    },
  ], [])

  const paymentMethods = useMemo(() => [
    {
      id: "COD",
      name: "Thanh toán khi nhận hàng",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      badge: "Phổ biến"
    },
    {
      id: "SEPAY",
      name: "Ví điện tử Sepay",
      description: "Thanh toán nhanh chóng qua Sepay",
      icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      id: "BANK",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản trực tiếp qua ngân hàng",
      icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      id: "VNPAY",
      name: "Thanh toán qua VNPAY",
      description: "Thanh toán an toàn với VNPAY",
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      badge: "An toàn"
    }
  ], [])

  useEffect(() => {
    fetchCart()
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!cart?.user || provinces.length === 0) return
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

  }, [cart?.user, provinces])

  const isBuyNow = useMemo(() => buyNowData?.mode === "buyNow", [buyNowData])

  const buyNowSubtotal = useMemo(() => 
    isBuyNow
      ? (buyNowData.product?.sellingPrice || 0) * (buyNowData.quantity || 1)
      : cart?.subtotal || 0
  , [isBuyNow, buyNowData, cart?.subtotal])

  const shippingFee = useMemo(() => 
    shippingMethod === "express" ? 50000 : 30000
  , [shippingMethod])

  const buyNowTotal = useMemo(() => 
    buyNowSubtotal - (buyNowData ? buyNowDiscountAmount : cart?.discount || 0) + shippingFee
  , [buyNowSubtotal, buyNowData, buyNowDiscountAmount, cart?.discount, shippingFee])

  const displayShippingFee = useMemo(() => 
    cart?.shipping ?? shippingFee
  , [cart?.shipping, shippingFee])

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
    import('@/data/provinces.json').then((data) => setProvinces(data.default))
  }, [])

  const removeItem = useCallback(async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      fetchCart()
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }, [fetchCart])

  const updateQuantity = useCallback(async (itemId, newQuantity) => {
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
  }, [removeItem, fetchCart])

  const handleProvinceChange = useCallback((e) => {
    const provinceCode = e.target.value
    const selectedProvince = provinces.find(p => p.code == provinceCode)

    setDistricts(selectedProvince?.districts || [])
    setWards([])

    setForm(prevForm => ({
      ...prevForm,
      provinceCode: provinceCode,
      districtCode: "",
      wardCode: "",
    }))
  }, [provinces])

  const handleWardChange = useCallback((e) => {
    const wardCode = e.target.value
    setForm(prevForm => ({
      ...prevForm,
      wardCode: wardCode,
    }))
  }, [])

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const handleDistrictChange = useCallback((e) => {
    const district = e.target.value
    const selectedDistrict = districts.find(d => d.code == district)
    setWards(selectedDistrict?.wards || [])
    setForm(prevForm => ({
      ...prevForm,
      districtCode: district,
      wardCode: "",
    }))
  }, [districts])

  const handlePaymentChange = useCallback((method) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }))
  }, [])

  const handleBankPayment = async (invoiceNumber, totalAmount) => {
    try {
      const res = await api.post("/sepay-webhook/create-payment", {
        invoiceNumber,
        amount: totalAmount,
        description: `Thanh toán đơn hàng ${invoiceNumber}`,
      })

      const { checkoutURL, formFields } = res.data

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
          discount: buyNowDiscountAmount,
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
      const order = res.data
      const orderId = order._id
      const invoiceNumber = res.data._id
      const total = res.data.total

      if (form.paymentMethod === "SEPAY") {
        await handleBankPayment(invoiceNumber, total)
        fetchCart()
      } else if (form.paymentMethod === "VNPAY") {
        const vnpayRes = await api.post("/vnpay/create-payment", {
          orderId,
          amount: total,
        })
        if (vnpayRes.data?.url) {
          window.location.href = vnpayRes.data.url
          return
        }
        fetchCart()
      }
      else if (form.paymentMethod === "BANK") {
        setOrderData(order)
        setShowBankModal(true)
        return
      } {
        fetchCart()
        toast.success("Đặt hàng thành công 🎉")
        navigate("/orders")
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đặt hàng thất bại")
    }
  }

  const handleApplyVoucher = useCallback(async (code) => {
    try {
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
      fetchCart()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mã giảm giá không hợp lệ")
    }
  }, [buyNowData, isBuyNow, shippingMethod, cart?.subtotal, setCart, fetchCart])

  if (!cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-base sm:text-lg font-medium">Không có sản phẩm trong giỏ hàng</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 z-50">
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-semibold text-base sm:text-lg text-center">Đang tải thông tin đặt hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-[1550px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-slideDown">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Thanh toán đơn hàng
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 font-medium">
                Hoàn tất thông tin để đặt hàng thành công
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Side: Shipping Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipping Information */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 animate-slideUp">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Thông tin giao hàng</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="group">
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      Họ và tên *
                    </label>
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      type="text" 
                      placeholder="Nhập họ và tên" 
                      className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm" 
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      Số điện thoại *
                    </label>
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      type="tel" 
                      placeholder="Nhập số điện thoại" 
                      className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm" 
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    Email
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="Nhập email" 
                    className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <MapPinned className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      Tỉnh/Thành phố *
                    </label>
                    <select 
                      onChange={handleProvinceChange} 
                      value={form.provinceCode} 
                      className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Quận/Huyện *</label>
                    <select 
                      onChange={handleDistrictChange} 
                      value={form.districtCode} 
                      className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                      disabled={districts.length === 0}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Phường/Xã *</label>
                    <select 
                      onChange={handleWardChange} 
                      value={form.wardCode} 
                      className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                      disabled={wards.length === 0}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Số nhà, tên đường *</label>
                  <input 
                    name="address" 
                    type="text" 
                    value={form.address} 
                    onChange={handleChange} 
                    placeholder="Số nhà, tên đường, thôn xóm..." 
                    className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all bg-white shadow-sm" 
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Ghi chú cho đơn hàng</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao hàng vào buổi tối, gọi điện trước khi giao..."
                    rows="3"
                    className="w-full p-2.5 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all resize-none bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Phương thức vận chuyển</h3>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {shippingOptions.map((option) => (
                  <label 
                    key={option.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-5 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 ${
                      shippingMethod === option.id 
                        ? "border-pink-400 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 shadow-lg scale-[1.02]" 
                        : "border-gray-200 hover:border-pink-300 hover:bg-gray-50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 mb-2 sm:mb-0">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={shippingMethod === option.id}
                        onChange={() => setShippingMethod(option.id)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                      />
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${shippingMethod === option.id ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm sm:text-base text-gray-800">{option.name}</span>
                            {option.id === "express" && (
                              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                                Nhanh
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{option.time} • {option.description}</p>
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-base sm:text-lg text-gray-900 ml-9 sm:ml-4">{option.price.toLocaleString("vi-VN")}₫</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl shadow-lg">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentChange(method.id)}
                    className={`flex items-center p-3 sm:p-5 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 ${
                      form.paymentMethod === method.id 
                        ? "border-pink-400 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 shadow-lg scale-[1.02]" 
                        : "border-gray-200 hover:border-pink-300 hover:bg-gray-50 hover:shadow-md"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      id={method.id}
                      checked={form.paymentMethod === method.id}
                      onChange={() => handlePaymentChange(method.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
                    />
                    <div className="flex items-center gap-3 sm:gap-4 ml-3 flex-1">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${form.paymentMethod === method.id ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label htmlFor={method.id} className="font-bold text-sm sm:text-base text-gray-800 cursor-pointer">
                            {method.name}
                          </label>
                          {method.badge && (
                            <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${
                              method.badge === "Phổ biến" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-green-100 text-green-700"
                            }`}>
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:sticky lg:top-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Đơn hàng của bạn</h2>
              </div>

              <AddproductSearch />

              {/* Product List */}
              <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[280px] overflow-y-auto pr-1 sm:pr-2 mb-4 sm:mb-6 custom-scrollbar">
                {buyNowData?.mode === "buyNow" ? (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-pink-200 shadow-sm hover:shadow-md transition-all">
                    <img
                      src={buyNowData?.product?.mainImage || "/images/Product.jpg"}
                      alt={buyNowData?.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 truncate mb-1">{buyNowData?.product?.name}</p>
                      <p className="text-xs text-gray-600 mb-1 sm:mb-2">
                        Size: <span className="font-semibold">{buyNowData?.size}</span> | Màu: <span className="font-semibold">{buyNowData?.color}</span>
                      </p>
                      <p className="text-pink-600 font-black text-base sm:text-lg">
                        {buyNowData?.product?.sellingPrice?.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <div className="text-center bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm">
                      <span className="font-black text-base sm:text-lg text-gray-800">x{buyNowData?.quantity}</span>
                    </div>
                  </div>
                ) : (
                  cart?.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-pink-200 shadow-sm hover:shadow-md transition-all">
                      <img
                        src={item?.product?.mainImage || "/images/Product.jpg"}
                        alt={item?.product?.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base text-gray-800 truncate mb-1">{item?.product?.name}</p>
                        <p className="text-xs text-gray-600 mb-1 sm:mb-2">
                          Size: <span className="font-semibold">{item?.size}</span> | Màu: <span className="font-semibold">{item?.color}</span>
                        </p>
                        <p className="text-pink-600 font-black text-base sm:text-lg">
                          {item?.product?.sellingPrice?.toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => updateQuantity(item?._id, item?.quantity - 1)}
                          className="p-1.5 sm:p-2 bg-white border-2 border-pink-300 rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all active:scale-90 shadow-sm"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="min-w-[25px] sm:min-w-[35px] text-center font-black text-base sm:text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item?._id, item?.quantity + 1)}
                          className="p-1.5 sm:p-2 bg-white border-2 border-pink-300 rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all active:scale-90 shadow-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Voucher Section */}
              <VoucherSection
                voucherCode={voucherCode}
                setVoucherCode={setVoucherCode}
                onApplyVoucher={handleApplyVoucher}
                buyNowData={buyNowData}
                isBuyNow={isBuyNow}
              />

              {/* Order Summary */}
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5 border-t-2 border-dashed border-gray-300">
                <div className="flex justify-between items-center">
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">Tạm tính:</p>
                  <p className="font-black text-gray-800 text-base sm:text-lg">
                    {buyNowSubtotal.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">Giảm giá:</p>
                  <p className="font-black text-green-600 text-base sm:text-lg">
                    -{buyNowData ? buyNowDiscountAmount.toLocaleString("vi-VN") : cart?.discount?.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">Phí vận chuyển:</p>
                  <p className="font-black text-gray-800 text-base sm:text-lg">
                    {buyNowData ? shippingFee.toLocaleString("vi-VN") : displayShippingFee.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold pt-3 sm:pt-4 border-t-2 border-dashed border-pink-300">
                  <p className="text-gray-800 text-base sm:text-lg">Tổng cộng:</p>
                  <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {buyNowData ? buyNowTotal.toLocaleString("vi-VN") : buyNowTotal.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>

              <button
                onClick={handleOrder}
                className="w-full mt-4 sm:mt-6 py-3 sm:py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white text-sm sm:text-base font-black rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                Hoàn tất đặt hàng
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Security Badge */}
              <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t-2 border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 bg-green-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="font-semibold">Thanh toán an toàn & bảo mật 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBankModal && (
        <BankPaymentModal
          order={orderData}
          onClose={() => setShowBankModal(false)}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #a855f7);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #db2777, #9333ea);
        }
      `}</style>
    </div>
  )
}

export default Checkout
