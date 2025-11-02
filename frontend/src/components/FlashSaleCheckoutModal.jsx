import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import apiUser from "@/service/api"

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
  const variations = item?.product?.variations || []
  const colors = [...new Set(variations.map(v => v.color))]
  const availableSizes = selectedColor
    ? variations
      .filter(v => v.color === selectedColor && v.stock > 0)
      .map(v => v.size)
    : []
  const basePrice = item?.salePrice || item?.product?.sellingPrice || 0
  const safeBasePrice = Number(basePrice) || 0
  const safeShippingFee = Number(shippingFee) || 0
  const safeDiscount = Number(discount) || 0
  const [total, setTotal] = useState(safeBasePrice + safeShippingFee - safeDiscount)

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

          // 2️⃣ Lấy danh sách quận/huyện
          const resDistrict = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
          const dataDistrict = await resDistrict.json()
          setDistricts(dataDistrict.districts || [])

          // 3️⃣ Tìm district code
          const district = dataDistrict.districts?.find(d => d.name === users.district)
          if (district) {
            setForm(prev => ({ ...prev, districtCode: district.code }))

            // 4️⃣ Lấy danh sách phường/xã
            const resWard = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
            const dataWard = await resWard.json()
            setWards(dataWard.wards || [])

            // 5️⃣ Tìm ward code
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
      const res = await apiUser.post("/vouchers/apply-voucher", { code: form.voucherCode, basePrice, product: item.product, quantity: item.quantity })
      setVoucher(res.data)

      setDiscount(res.data.discount)

      toast.success("Áp dụng mã giảm giá thành công!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã không hợp lệ")
      setVoucher(null)
      setDiscount(0)
    }
  }

  useEffect(() => {
    if (form.shippingMethod === "NHANH") setShippingFee(30000)
    else if (form.shippingMethod === "HOA_TOC") setShippingFee(50000)
  }, [form.shippingMethod])

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address)
      return toast.error("Vui lòng nhập đủ thông tin giao hàng")

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
      discount:discount,
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
      await apiUser.post("/flash-sales/purchase", payload)
      toast.success("🎉 Đặt hàng thành công!")
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đặt hàng")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-pink-200 flex flex-col max-h-[99vh]">
        <h2 className=" text-2xl font-bold mb-4 text-center text-pink-700">
          Thanh toán Flash Sale
        </h2>

        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-3">
            {/* Sản phẩm */}
            <div className="bg-white p-3 rounded-lg shadow">
              <p className="font-semibold">{item?.product?.name}</p>
              <p className="text-red-600 font-bold">{basePrice.toLocaleString()}đ</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div>
                <p className="font-semibold mb-1 text-gray-700">Màu sắc: {selectedColor || "—"}</p>
                <div className="flex gap-2 flex-wrap">
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
                        className={`px-3 py-1 rounded-full border transition-all duration-200
              ${isSelected ? "bg-pink-100 border-pink-500 text-pink-600" : "border-gray-300 hover:bg-pink-50"}
              ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedColor && (
                <div>
                  <p className="font-semibold mb-1 text-gray-700">Kích thước: {selectedSize || "—"}</p>
                  <div className="flex gap-2 flex-wrap">
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
                          className={`px-3 py-1 rounded-full border transition-all duration-200
                ${isSelected ? "bg-pink-100 border-pink-500 text-pink-600" : "border-gray-300 hover:bg-pink-50"}
                ${variant?.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedColor && selectedSize && (
                <p className="text-sm text-gray-600">
                  {stock > 0 ? (
                    <span className="text-green-600 font-medium">Còn hàng ({stock} sản phẩm)</span>
                  ) : (
                    <span className="text-red-500 font-medium">Hết hàng</span>
                  )}
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder="Họ và tên"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Địa chỉ (số nhà, đường...)"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="grid grid-cols-3 gap-2">
              <select
                value={form.provinceCode}
                onChange={e => handleProvinceChange(e.target.value)}
                className="border rounded-lg px-2 py-2"
              >
                <option value="">Tỉnh / Thành</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>

              <select
                value={form.districtCode}
                onChange={e => handleDistrictChange(e.target.value)}
                className="border rounded-lg px-2 py-2"
              >
                <option value="">Quận / Huyện</option>
                {districts.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>

              <select
                value={form.wardCode}
                onChange={e => handleWardChange(e.target.value)}
                className="border rounded-lg px-2 py-2"
              >
                <option value="">Phường / Xã</option>
                {wards.map(w => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập mã voucher"
                value={form.voucherCode}
                onChange={e => setForm({ ...form, voucherCode: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleApplyVoucher}
                className="bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600"
              >
                Áp dụng
              </button>
            </div>

            <select
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="COD">Thanh toán khi nhận hàng (COD)</option>
              <option value="BANK">Chuyển khoản ngân hàng</option>
              <option value="MOMO">Ví Momo</option>
              <option value="VNPAY">VNPay</option>
            </select>

            <select
              value={form.shippingMethod}
              onChange={e => setForm({ ...form, shippingMethod: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="NHANH">Giao hàng nhanh (30.000đ)</option>
              <option value="HOA_TOC">Hỏa tốc (50.000đ)</option>
            </select>

            <textarea
              placeholder="Ghi chú đơn hàng"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{basePrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString()}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{discount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{total.toLocaleString()}đ</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default FlashSaleCheckoutModal
