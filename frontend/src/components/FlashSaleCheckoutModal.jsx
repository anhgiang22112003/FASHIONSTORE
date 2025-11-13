import React, { useState, useEffect, useMemo } from "react"
import { toast } from "react-toastify"
import apiUser from "@/service/api"
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck, 
  Gift, 
  Tag, 
  Shield,
  CheckCircle,
  Clock,
  Zap,
  User,
  Phone,
  Mail,
  MessageSquare,
  Sparkles
} from "lucide-react"

const FlashSaleCheckoutModal = ({ item, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    note: "",
    paymentMethod: "COD",
    shippingMethod: "NHANH",
    voucherCode: "",
  })
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [stock, setStock] = useState(0)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [voucher, setVoucher] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [shippingFee, setShippingFee] = useState(30000)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)

  // Memoized calculations for performance
  const variations = useMemo(() => item?.product?.variations || [], [item])
  const colors = useMemo(() => [...new Set(variations.map(v => v.color))], [variations])
  const availableSizes = useMemo(() => 
    selectedColor
      ? variations
          .filter(v => v.color === selectedColor && v.stock > 0)
          .map(v => v.size)
      : [],
    [variations, selectedColor]
  )

  const basePrice = item?.salePrice || item?.product?.sellingPrice || 0
  const safeBasePrice = Number(basePrice) || 0
  const safeShippingFee = Number(shippingFee) || 0
  const safeDiscount = Number(discount) || 0
  const [total, setTotal] = useState(safeBasePrice + safeShippingFee - safeDiscount)

  const shippingOptions = [
    { 
      id: "NHANH", 
      name: "Giao hàng tiêu chuẩn", 
      price: 30000, 
      icon: <Truck className="w-5 h-5" />,
      time: "3-5 ngày"
    },
    { 
      id: "HOA_TOC", 
      name: "Giao hàng hỏa tốc", 
      price: 50000, 
      icon: <Zap className="w-5 h-5" />,
      time: "1-2 ngày"
    },
  ]

  const paymentMethods = [
    { id: "COD", name: "Thanh toán khi nhận hàng", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "BANK", name: "Chuyển khoản ngân hàng", icon: <CreditCard className="w-5 h-5" /> },
    { id: "MOMO", name: "Ví Momo", icon: <CreditCard className="w-5 h-5" /> },
    { id: "VNPAY", name: "VNPay", icon: <Shield className="w-5 h-5" /> }
  ]

  useEffect(() => {
    setTotal(Number(basePrice) + Number(shippingFee) - Number(discount))
  }, [basePrice, shippingFee, discount])

  const user = JSON.parse(localStorage.getItem("user"))

  const fetchCustomer = async () => {
    try {
      const res = await apiUser.get(`/users/${user.id}`)
      setUsers(res.data)
    } catch (error) {
      console.log("Lỗi lấy thông tin user:", error)
    }
  }

  useEffect(() => {
    if (user) fetchCustomer()
  }, [])

  useEffect(() => {
    if (users) {
      const { name, phone, address, ward, district, province } = users
      const fullAddress = [address, ward, district, province].filter(Boolean).join(", ")

      setForm(prev => ({
        ...prev,
        name: name || "",
        phone: phone || "",
        address: fullAddress || "",
      }))
    }
  }, [users])

  useEffect(() => {
    const autoSelectLocation = async () => {
      if (!users || provinces.length === 0) return

      try {
        const province = provinces.find(p => p.name === users.province)
        if (province) {
          setForm(prev => ({ ...prev, provinceCode: province.code }))

          const resDistrict = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
          const dataDistrict = await resDistrict.json()
          setDistricts(dataDistrict.districts || [])

          const district = dataDistrict.districts?.find(d => d.name === users.district)
          if (district) {
            setForm(prev => ({ ...prev, districtCode: district.code }))

            const resWard = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
            const dataWard = await resWard.json()
            setWards(dataWard.wards || [])

            const ward = dataWard.wards?.find(w => w.name === users.ward)
            if (ward) {
              setForm(prev => ({ ...prev, wardCode: ward.code }))
            }
          }
        }
      } catch (err) {
        console.log("Lỗi auto điền địa chỉ:", err)
      }
    }

    autoSelectLocation()
  }, [users, provinces])

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(setProvinces)
  }, [])

  const handleProvinceChange = async (code) => {
    setForm({ ...form, provinceCode: code, districtCode: "", wardCode: "" })
    const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
    const data = await res.json()
    setDistricts(data.districts || [])
    setWards([])
  }

  const handleDistrictChange = async (code) => {
    setForm({ ...form, districtCode: code, wardCode: "" })
    const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
    const data = await res.json()
    setWards(data.wards || [])
  }

  const handleWardChange = (code) => {
    setForm({ ...form, wardCode: code })
  }

  const handleApplyVoucher = async () => {
    if (!form.voucherCode) return toast.info("Nhập mã voucher trước")
    try {
      setIsApplyingVoucher(true)
      const res = await apiUser.post("/vouchers/apply-voucher", { 
        code: form.voucherCode, 
        basePrice, 
        product: item.product, 
        quantity: item.quantity 
      })
      setVoucher(res.data)
      setDiscount(res.data.discount)
      toast.success("Áp dụng mã giảm giá thành công!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã không hợp lệ")
      setVoucher(null)
      setDiscount(0)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  useEffect(() => {
    if (form.shippingMethod === "NHANH") setShippingFee(30000)
    else if (form.shippingMethod === "HOA_TOC") setShippingFee(50000)
  }, [form.shippingMethod])

  const handleBankPayment = async (invoiceNumber, totalAmount) => {
    try {
      const res = await apiUser.post("/sepay-webhook/create-payment", {
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

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address)
      return toast.error("Vui lòng nhập đủ thông tin giao hàng")

    if (!selectedColor || !selectedSize)
      return toast.error("Vui lòng chọn màu sắc và kích thước")

    const provinceName = provinces.find(p => p.code == form.provinceCode)?.name || ""
    const districtName = districts.find(d => d.code == form.districtCode)?.name || ""
    const wardName = wards.find(w => w.code == form.wardCode)?.name || ""
    const fullAddress = [form.address, wardName, districtName, provinceName]
      .filter(Boolean)
      .join(", ")

    const payload = {
      itemId: item._id,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      address: fullAddress,
      discount: discount,
      paymentMethod: form.paymentMethod,
      shippingMethod: form.shippingMethod,
      voucherCode: form.voucherCode || undefined,
      note: form.note,
      shippingInfo: {
        name: form.name,
        phone: form.phone,
        address: fullAddress,
      },
    }

    try {
      setLoading(true)
      const res = await apiUser.post("/flash-sales/purchase", payload)
      console.log(res)
      
      const invoiceNumber = res.data._id
      const total = res.data.total
      if (form.paymentMethod === "BANK") {
        await handleBankPayment(invoiceNumber, total)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đặt hàng")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-pink-200 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Flash Sale Checkout</h2>
              <p className="text-pink-100 text-sm">Hoàn tất đơn hàng flash sale của bạn</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Product & Variants */}
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={item?.product?.mainImage} 
                    alt={item?.product?.name}
                    className="w-20 h-20 rounded-xl object-cover shadow-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{item?.product?.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {basePrice.toLocaleString()}đ
                      </span>
                      <div className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                        FLASH SALE
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color & Size Selection */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-pink-500" />
                  Tùy chọn sản phẩm
                </h4>
                
                {/* Color Selection */}
                <div className="mb-6">
                  <p className="font-semibold mb-3 text-gray-700">
                    Màu sắc: <span className="text-pink-600">{selectedColor || "Chưa chọn"}</span>
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map(color => {
                      const isSelected = selectedColor === color
                      const hasStock = variations.some(v => v.color === color && v.stock > 0)
                      return (
                        <button
                          key={color}
                          disabled={!hasStock}
                          onClick={() => {
                            setSelectedColor(color)
                            setSelectedSize("")
                            setStock(0)
                          }}
                          className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 ${
                            isSelected 
                              ? "bg-gradient-to-r from-pink-100 to-purple-100 border-pink-400 text-pink-600 shadow-md" 
                              : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                          } ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {color}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Size Selection */}
                {selectedColor && (
                  <div className="mb-4">
                    <p className="font-semibold mb-3 text-gray-700">
                      Kích thước: <span className="text-pink-600">{selectedSize || "Chưa chọn"}</span>
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {availableSizes.map(size => {
                        const variant = variations.find(v => v.color === selectedColor && v.size === size)
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            disabled={variant?.stock === 0}
                            onClick={() => {
                              setSelectedSize(size)
                              setStock(variant?.stock || 0)
                            }}
                            className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 min-w-[60px] ${
                              isSelected 
                                ? "bg-gradient-to-r from-pink-100 to-purple-100 border-pink-400 text-pink-600 shadow-md" 
                                : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                            } ${variant?.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Info */}
                {selectedColor && selectedSize && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium">
                      {stock > 0 ? (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Còn hàng ({stock} sản phẩm)
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Hết hàng
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form & Summary */}
            <div className="space-y-6">
              {/* Shipping Info */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Thông tin giao hàng
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Địa chỉ (số nhà, đường...)"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={form.provinceCode}
                      onChange={e => handleProvinceChange(e.target.value)}
                      className="p-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    >
                      <option value="">Tỉnh / Thành</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>

                    <select
                      value={form.districtCode}
                      onChange={e => handleDistrictChange(e.target.value)}
                      className="p-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    >
                      <option value="">Quận / Huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>

                    <select
                      value={form.wardCode}
                      onChange={e => handleWardChange(e.target.value)}
                      className="p-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    >
                      <option value="">Phường / Xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Voucher */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-orange-500" />
                  Mã giảm giá
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nhập mã voucher"
                    value={form.voucherCode}
                    onChange={e => setForm({ ...form, voucherCode: e.target.value })}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-300 shadow-lg"
                  >
                    {isApplyingVoucher ? "..." : "Áp dụng"}
                  </button>
                </div>
              </div>

              {/* Shipping & Payment Methods */}
              <div className="grid grid-cols-1 gap-4">
                {/* Shipping Method */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-500" />
                    Phương thức vận chuyển
                  </h4>
                  <div className="space-y-3">
                    {shippingOptions.map(option => (
                      <label 
                        key={option.id}
                        className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          form.shippingMethod === option.id 
                            ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50" 
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={form.shippingMethod === option.id}
                            onChange={e => setForm({ ...form, shippingMethod: e.target.value })}
                            className="w-4 h-4 text-green-600"
                          />
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <div>
                              <span className="font-semibold text-gray-800">{option.name}</span>
                              <p className="text-sm text-gray-600">{option.time}</p>
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">{option.price.toLocaleString()}đ</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    Phương thức thanh toán
                  </h4>
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <label 
                        key={method.id}
                        className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          form.paymentMethod === method.id 
                            ? "border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50" 
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={form.paymentMethod === method.id}
                          onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                          className="w-4 h-4 text-purple-600 mr-3"
                        />
                        <div className="flex items-center gap-2">
                          {method.icon}
                          <span className="font-semibold text-gray-800">{method.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  Ghi chú đơn hàng
                </h4>
                <textarea
                  placeholder="Ghi chú đơn hàng (tùy chọn)"
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  rows="3"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Order Summary & Actions */}
        <div className="border-t-2 border-gray-100 p-6 bg-gray-50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Order Summary */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-semibold">{basePrice.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-semibold">{shippingFee.toLocaleString()}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-semibold">-{discount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {total.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full lg:w-auto">
              <button
                onClick={onClose}
                className="flex-1 lg:flex-none px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedColor || !selectedSize || stock === 0}
                className="flex-1 lg:flex-none px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận đặt hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashSaleCheckoutModal