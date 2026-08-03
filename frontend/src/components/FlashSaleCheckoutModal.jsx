import React, { useState, useEffect, useMemo, useCallback, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import apiUser from "@/service/api"
import { AuthContext } from '@/context/AuthContext'
import {
  X,
  MapPin,
  CreditCard,
  Truck,
  Gift,
  CheckCircle,
  Zap,
  User,
  Phone,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  Edit3,
  Shield
} from "lucide-react"

/* ─── helpers ─────────────────────────────────────────── */
const formatPrice = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "đ"

const COLLAPSIBLE_STYLES = {
  content: "grid transition-all duration-300 ease-in-out",
}

/* ─── main component ─────────────────────────────────── */
const FlashSaleCheckoutModal = ({ item, onClose, onSuccess }) => {
  /* ── state ────────────────────────────── */
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
  const [quantity, setQuantity] = useState(1)
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

  // UI collapse states
  const [addressExpanded, setAddressExpanded] = useState(false)
  const [voucherExpanded, setVoucherExpanded] = useState(false)
  const [noteExpanded, setNoteExpanded] = useState(false)

  /* ── derived ──────────────────────────── */
  const variations = useMemo(() => item?.product?.variations || [], [item])
  const colors = useMemo(
    () => [...new Set(variations.map((v) => v.color))],
    [variations]
  )
  const availableSizes = useMemo(
    () =>
      selectedColor
        ? variations
            .filter((v) => v.color === selectedColor && v.stock > 0)
            .map((v) => v.size)
        : [],
    [variations, selectedColor]
  )
  const currentVariant = useMemo(
    () =>
      variations.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ),
    [variations, selectedColor, selectedSize]
  )
  const currentStock = currentVariant?.stock || 0

  const unitPrice = item?.salePrice || item?.product?.sellingPrice || 0
  const basePrice = unitPrice * quantity
  const total = basePrice + shippingFee - discount

  const isReady =
    form.name &&
    form.phone &&
    form.address &&
    form.provinceCode &&
    form.districtCode &&
    form.wardCode &&
    selectedColor &&
    selectedSize &&
    currentStock > 0

  /* ── progress (0 → 100) ───────────────── */
  const progress = useMemo(() => {
    let p = 0
    if (selectedColor && selectedSize) p += 35
    if (form.name && form.phone && form.address) p += 35
    if (form.provinceCode && form.districtCode && form.wardCode) p += 15
    if (form.paymentMethod) p += 15
    return p
  }, [selectedColor, selectedSize, form, form.paymentMethod])

  /* ── shipping / payment options ────────── */
  const shippingOptions = [
    { id: "NHANH", name: "Tiêu chuẩn", price: 30000, icon: <Truck className="w-4 h-4" />, time: "3-5 ngày" },
    { id: "HOA_TOC", name: "Hỏa tốc", price: 50000, icon: <Zap className="w-4 h-4" />, time: "1-2 ngày" },
  ]
  const paymentMethods = [
    { id: "COD", name: "Thanh toán khi nhận hàng", icon: <Package className="w-4 h-4" /> },
    { id: "BANK", name: "Chuyển khoản ngân hàng", icon: <CreditCard className="w-4 h-4" /> },
    { id: "MOMO", name: "Ví MoMo", icon: <CreditCard className="w-4 h-4" /> },
    { id: "VNPAY", name: "VNPay", icon: <Shield className="w-4 h-4" /> },
  ]

  /* ── effects ──────────────────────────── */
  useEffect(() => {
    if (form.shippingMethod === "NHANH") setShippingFee(30000)
    else if (form.shippingMethod === "HOA_TOC") setShippingFee(50000)
  }, [form.shippingMethod])

  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const fetchCustomer = async () => {
    try {
      const res = await apiUser.get(`/users/${user.id}`)
      setUsers(res.data)
    } catch { /* silent */ }
  }

  useEffect(() => {
    if (user) fetchCustomer()
  }, [user])

  // auto-fill address from profile
  useEffect(() => {
    if (!users) return
    const { name, phone, address, ward, district, province } = users
    const fullAddr = [address, ward, district, province].filter(Boolean).join(", ")
    setForm((prev) => ({
      ...prev,
      name: name || "",
      phone: phone || "",
      address: fullAddr || "",
    }))
    // collapse if profile is complete
    if (name && phone && fullAddr) setAddressExpanded(false)
    else setAddressExpanded(true)
  }, [users])

  // auto-select province/district/ward codes from profile
  useEffect(() => {
    if (!users || provinces.length === 0) return
    const autoSelect = async () => {
      try {
        const prov = provinces.find((p) => p.name === users.province)
        if (!prov) return
        setForm((prev) => ({ ...prev, provinceCode: prov.code }))
        const dRes = await fetch(
          `https://provinces.open-api.vn/api/p/${prov.code}?depth=2`
        )
        const dData = await dRes.json()
        setDistricts(dData.districts || [])
        const dist = dData.districts?.find((d) => d.name === users.district)
        if (!dist) return
        setForm((prev) => ({ ...prev, districtCode: dist.code }))
        const wRes = await fetch(
          `https://provinces.open-api.vn/api/d/${dist.code}?depth=2`
        )
        const wData = await wRes.json()
        setWards(wData.wards || [])
        const w = wData.wards?.find((w) => w.name === users.ward)
        if (w) setForm((prev) => ({ ...prev, wardCode: w.code }))
      } catch { /* silent */ }
    }
    autoSelect()
  }, [users, provinces])

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((r) => r.json())
      .then(setProvinces)
  }, [])

  /* ── handlers ─────────────────────────── */
  const handleProvinceChange = async (code) => {
    setForm((prev) => ({ ...prev, provinceCode: code, districtCode: "", wardCode: "" }))
    const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
    const data = await res.json()
    setDistricts(data.districts || [])
    setWards([])
  }
  const handleDistrictChange = async (code) => {
    setForm((prev) => ({ ...prev, districtCode: code, wardCode: "" }))
    const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
    const data = await res.json()
    setWards(data.wards || [])
  }
  const handleWardChange = (code) => {
    setForm((prev) => ({ ...prev, wardCode: code }))
  }

  const handleApplyVoucher = async () => {
    if (!form.voucherCode) return toast.info("Nhập mã voucher trước")
    try {
      setIsApplyingVoucher(true)
      const res = await apiUser.post("/vouchers/apply-voucher", {
        code: form.voucherCode,
        basePrice,
        product: item.product,
        quantity,
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
      Object.keys(formFields).forEach((key) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = formFields[key]
        formEl.appendChild(input)
      })
      document.body.appendChild(formEl)
      formEl.submit()
    } catch {
      toast.error("Tạo thanh toán thất bại")
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt hàng flash sale')
      navigate('/login')
      return
    }
    if (!form.name || !form.phone || !form.address)
      return toast.error("Vui lòng nhập đủ thông tin giao hàng")
    if (!selectedColor || !selectedSize)
      return toast.error("Vui lòng chọn màu sắc và kích thước")

    const provinceName =
      provinces.find((p) => p.code == form.provinceCode)?.name || ""
    const districtName =
      districts.find((d) => d.code == form.districtCode)?.name || ""
    const wardName =
      wards.find((w) => w.code == form.wardCode)?.name || ""
    const fullAddress = [form.address, wardName, districtName, provinceName]
      .filter(Boolean)
      .join(", ")

    const payload = {
      itemId: item._id,
      quantity,
      color: selectedColor,
      size: selectedSize,
      address: fullAddress,
      discount,
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
      const invoiceNumber = res.data._id
      const totalAmount = res.data.total
      toast.success("Đặt hàng flash sale thành công!")

      if (form.paymentMethod === "BANK") {
        await handleBankPayment(invoiceNumber, totalAmount)
      }

      onSuccess?.(invoiceNumber)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đặt hàng")
    } finally {
      setLoading(false)
    }
  }

  /* ── address display line ─────────────── */
  const addressDisplay = useMemo(() => {
    if (form.name && form.phone && form.address) {
      return `${form.name} · ${form.phone} · ${form.address}`
    }
    return null
  }, [form.name, form.phone, form.address])

  /* ════════════════════════════════════════════════════════
     RENDER — single-column compact layout
     ════════════════════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-lg sm:mx-4 bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        {/* ── Header ─────────────────────── */}
        <div className="relative flex-shrink-0 flex items-center justify-between gap-3 border-b border-pink-100 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 px-5 py-4 rounded-t-3xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Flash Sale Checkout
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Hoàn tất trong nháy mắt ⚡
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 backdrop-blur p-2 text-white transition hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Progress bar ───────────────── */}
        <div className="flex-shrink-0 h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Scrollable body ────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-5 space-y-3">

            {/* ─── 1. Product card ───────── */}
            <div className="flex gap-3.5 p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-pink-100">
              <img
                src={item?.product?.mainImage}
                alt={item?.product?.name}
                className="w-20 h-20 rounded-xl object-cover shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                  {item?.product?.name}
                </h3>
                <div className="flex items-end justify-between gap-2 mt-1">
                  <span className="text-xl font-black text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                    {formatPrice(basePrice)}
                  </span>
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                    Flash Sale
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 2. Variant selection ───── */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4 space-y-4">
              {/* Color */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                    Màu sắc
                  </p>
                  {selectedColor && (
                    <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color
                    const hasStock = variations.some(
                      (v) => v.color === color && v.stock > 0
                    )
                    return (
                      <button
                        key={color}
                        disabled={!hasStock}
                        onClick={() => {
                          setSelectedColor(color)
                          setSelectedSize("")
                          setStock(0)
                        }}
                        className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-200
                          ${isSelected
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"
                          }
                          ${!hasStock ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Size */}
              {selectedColor && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
                      Kích thước
                    </p>
                    {selectedSize && (
                      <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        {selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const variant = variations.find(
                        (v) => v.color === selectedColor && v.size === size
                      )
                      const isDisabled = variant?.stock === 0
                      return (
                        <button
                          key={size}
                          disabled={isDisabled}
                          onClick={() => {
                            setSelectedSize(size)
                            setStock(variant?.stock || 0)
                          }}
                          className={`relative px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-200
                            ${selectedSize === size
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md"
                              : isDisabled
                                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"
                            }`}
                          title={isDisabled ? "Hết hàng" : `Còn: ${variant?.stock}`}
                        >
                          {isDisabled && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-full h-px bg-gray-400 rotate-45" />
                            </span>
                          )}
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              {selectedColor && selectedSize && currentStock > 0 && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-xs font-semibold text-gray-600">Số lượng</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 text-sm font-bold select-none"
                    >−</button>
                    <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      disabled={quantity >= currentStock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 text-sm font-bold select-none"
                    >+</button>
                  </div>
                </div>
              )}
            </div>

            {/* ─── 3. Shipping address (collapsible) ── */}
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <button
                onClick={() => setAddressExpanded(!addressExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-gray-800">
                    Giao tới
                  </span>
                  {addressDisplay && !addressExpanded && (
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {addressDisplay}
                    </span>
                  )}
                </div>
                {addressDisplay && !addressExpanded && (
                  <span className="text-xs font-semibold text-pink-600 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Thay đổi
                  </span>
                )}
                {!addressDisplay && (
                  <span className="text-xs text-red-500 font-medium">
                    Cần điền →
                  </span>
                )}
                {addressDisplay && (
                  addressExpanded
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <div
                className={`${COLLAPSIBLE_STYLES.content} ${
                  addressExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Họ và tên"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Số điện thoại"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Địa chỉ (số nhà, đường...)"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={form.provinceCode}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      >
                        <option value="">Tỉnh/Thành</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                      <select
                        value={form.districtCode}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      >
                        <option value="">Quận/Huyện</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                      <select
                        value={form.wardCode}
                        onChange={(e) => handleWardChange(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      >
                        <option value="">Phường/Xã</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── 4. Shipping + Payment (side by side) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shipping */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-3">
                  <Truck className="w-4 h-4 text-green-500" />
                  Vận chuyển
                </p>
                <div className="space-y-2">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition ${
                        form.shippingMethod === opt.id
                          ? "bg-green-50 border border-green-300"
                          : "border border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={form.shippingMethod === opt.id}
                        onChange={(e) =>
                          setForm({ ...form, shippingMethod: e.target.value })
                        }
                        className="h-3.5 w-3.5 text-green-600"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {opt.icon}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-tight">
                            {opt.name}
                          </p>
                          <p className="text-[10px] text-gray-500">{opt.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-700 shrink-0">
                        {formatPrice(opt.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl bg-white border border-gray-100 p-4">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-3">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  Thanh toán
                </p>
                <div className="space-y-2">
                  {paymentMethods.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition ${
                        form.paymentMethod === m.id
                          ? "bg-purple-50 border border-purple-300"
                          : "border border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={form.paymentMethod === m.id}
                        onChange={(e) =>
                          setForm({ ...form, paymentMethod: e.target.value })
                        }
                        className="h-3.5 w-3.5 text-purple-600"
                      />
                      {m.icon}
                      <span className="text-xs font-semibold text-gray-800">
                        {m.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── 5. Voucher (collapsible, default closed) ── */}
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <button
                onClick={() => setVoucherExpanded(!voucherExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-gray-800">
                    Mã giảm giá
                  </span>
                  {voucher && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      -{formatPrice(discount)}
                    </span>
                  )}
                </div>
                {voucherExpanded
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>

              <div
                className={`${COLLAPSIBLE_STYLES.content} ${
                  voucherExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã voucher"
                        value={form.voucherCode}
                        onChange={(e) =>
                          setForm({ ...form, voucherCode: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={isApplyingVoucher}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:from-orange-600 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                      >
                        {isApplyingVoucher ? "..." : "Áp dụng"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── 6. Note (collapsible, default closed) ── */}
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <button
                onClick={() => setNoteExpanded(!noteExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
              >
                <span className="text-sm font-bold text-gray-800">
                  Ghi chú đơn hàng
                </span>
                {noteExpanded
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>
              <div
                className={`${COLLAPSIBLE_STYLES.content} ${
                  noteExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <textarea
                      placeholder="Ghi chú (tùy chọn)..."
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      rows="3"
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* bottom spacer for sticky footer */}
            <div className="h-4" />
          </div>
        </div>

        {/* ── Sticky footer ──────────────── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 sm:px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {/* Price breakdown */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Tạm tính ({quantity} sản phẩm)</span>
            <span className="font-semibold text-gray-700">
              {formatPrice(basePrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Vận chuyển</span>
            <span className="font-semibold text-gray-700">
              {formatPrice(shippingFee)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-xs text-green-600 mb-1">
              <span>Giảm giá</span>
              <span className="font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}

          {/* Total + CTA */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Tổng cộng
              </p>
              <p className="text-xl font-black text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text leading-tight">
                {formatPrice(total)}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !isReady}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-600 hover:to-purple-700 hover:shadow-xl hover:shadow-pink-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Xác nhận đặt hàng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashSaleCheckoutModal
