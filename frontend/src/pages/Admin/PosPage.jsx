import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  PhotoIcon,
  UserIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import { toast } from "react-toastify"
import { socket } from "@/service/socket"
import CartSidebar from "@/components/CartSidebar"
import VoucherModal from "@/components/VoucherModal"
import BankPaymentModal from "@/components/BankPaymentSection"

const PosPage = () => {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedVariations, setSelectedVariations] = useState({})
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [showBankPayment, setShowBankPayment] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  // Staff management
  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState("")

  // Product filters
  const [filters, setFilters] = useState({
    category: "",
    collection: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    sortBy: ""
  })
  const [showFilters, setShowFilters] = useState(false)

  // Customer management
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: ""
  })

  // Discount management
  const [discountType, setDiscountType] = useState("NONE")
  const [discountValue, setDiscountValue] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [customerVouchers, setCustomerVouchers] = useState([])
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500) // delay 500ms

    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await apiAdmin.get("/users/staff", {
          params: { page: 1, limit: 100 }
        })
        setStaffList(res.data.data || [])
      } catch (err) {
        console.error("Error fetching staff:", err)
      }
    }
    fetchStaff()
  }, [])

  const fetchProducts = async () => {
    try {
      const params = {
        q: debouncedSearch,
        page,
        limit: 20,
        ...filters
      }
      const res = await apiAdmin.get("/products", { params })
      setProducts(res.data.products || [])
      setTotalPage(res.data.totalPages || 1)
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }


  // Load danh sách sản phẩm với filters
  useEffect(() => {
    fetchProducts()
  }, [debouncedSearch, filters, page])


  // Load danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await apiAdmin.get("/users", {
          params: { role: "customer", page: 1, limit: 100 }
        })
        setCustomers(res.data.data || [])
      } catch (err) {
        console.error("Error fetching customers:", err)
      }
    }
    fetchCustomers()
  }, [])

  // Load vouchers của khách hàng khi chọn khách hàng
  useEffect(() => {
    const fetchCustomerVouchers = async () => {
      if (!selectedCustomer?._id) {
        setCustomerVouchers([])
        setSelectedVoucher(null)
        if (discountType === "VOUCHER") {
          setDiscountType("NONE")
          setDiscountValue(0)
        }
        return
      }

      try {
        const res = await apiAdmin.get(`/vouchers`)
        setCustomerVouchers(res.data.data || [])
      } catch (err) {
        console.error("Error fetching customer vouchers:", err)
        setCustomerVouchers([])
      }
    }

    fetchCustomerVouchers()
  }, [selectedCustomer])

  const addToCartAPI = async (cartItem) => {
    try {
      const res = await apiAdmin.post("/pos/cart", cartItem)
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
      return null
    }
  }


  // Tính toán discount value dựa trên type
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    switch (discountType) {
      case "PERCENT":
        setDiscountValue(Math.round(subtotal * discountPercent / 100))
        break
      case "AMOUNT":
        setDiscountValue(Math.min(discountAmount, subtotal))
        break
      case "VOUCHER":
        if (selectedVoucher) {
          if (selectedVoucher.discountType === "percentage") {
            const voucherDiscount = Math.round(subtotal * selectedVoucher.discountValue / 100)
            setDiscountValue(selectedVoucher.maxDiscount ? Math.min(voucherDiscount, selectedVoucher.maxDiscount) : voucherDiscount)
          } else {
            setDiscountValue(selectedVoucher.discountValue)
          }
        } else {
          setDiscountValue(0)
        }
        break
      case "NONE":
      default:
        setDiscountValue(0)
        break
    }
  }, [discountType, discountPercent, discountAmount, selectedVoucher, cartItems])

  const handleVariationChange = (productId, type, value) => {
    setSelectedVariations(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }))
  }

  const getAvailableStock = (product) => {
    const selected = selectedVariations[product._id]
    if (!selected?.color || !selected?.size || !product.variations) {
      return product.stock || 0
    }

    const variation = product.variations.find(v =>
      v.color === selected.color && v.size === selected.size
    )
    return variation ? variation.stock : 0
  }

  const handleAddProduct = (product) => {
    if (!selectedStaff) {
      toast.info("Vui lòng chọn nhân viên!")
      return
    }

    const selected = selectedVariations[product._id]

    if (product.variations && product.variations.length > 0) {
      if (!selected?.color || !selected?.size) {
        toast.info("Vui lòng chọn màu sắc và kích thước!")
        return
      }

      const availableStock = getAvailableStock(product)
      if (availableStock <= 0) {
        toast.info("Biến thể này đã hết hàng!")
        return
      }
    }

    const cartKey = product.variations && product.variations.length > 0
      ? `${product._id}-${selected.color}-${selected.size}`
      : product._id

    const existing = cartItems.find((i) => i.cartKey === cartKey)

    if (existing) {
      existing.quantity += 1
      setCartItems([...cartItems])
    } else {
      const newItem = {
        cartKey,
        product: product._id,
        productName: product.name,
        price: product.sellingPrice,
        quantity: 1,
        mainImage: product.mainImage,
      }

      if (product.variations && product.variations.length > 0) {
        newItem.color = selected.color
        newItem.size = selected.size
        newItem.productName = `${product.name} (${selected.color}, ${selected.size})`
      }

      setCartItems([...cartItems, newItem])
    }
  }

  const handleChangeQuantity = (index, qty) => {
    if (qty <= 0) return
    cartItems[index].quantity = qty
    setCartItems([...cartItems])
  }

  const handleRemove = (index) => {
    cartItems.splice(index, 1)
    setCartItems([...cartItems])
  }

  const handleCustomerSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await apiAdmin.post("/users", {
        ...customerForm,
        role: "customer"
      })
      setCustomers([...customers, res.data])
      setSelectedCustomer(res.data)
      setShowCustomerForm(false)
      setCustomerForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        province: ""
      })
      toast.success("Thêm khách hàng thành công!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm khách hàng")
    }
  }

  const handleApplyVoucher = (voucher) => {
    setSelectedVoucher(voucher)
    setDiscountType("VOUCHER")
  }

  const handleRemoveDiscount = () => {
    setDiscountType("NONE")
    setDiscountValue(0)
    setDiscountPercent(0)
    setDiscountAmount(0)
    setSelectedVoucher(null)
  }

  const handleCheckout = async () => {
    if (!selectedStaff) {
      toast.info("Vui lòng chọn nhân viên!")
      return
    }

    setIsProcessing(true)
    try {
      const orderData = {
        items: cartItems,
        staffId: selectedStaff,
        customerId: selectedCustomer?._id,
        discount: discountValue,
        voucherId: selectedVoucher?._id
      }

      const cart = await apiAdmin.post("/pos/cart", orderData)

      const order = await apiAdmin.post("/pos/checkout", {
        cartId: cart.data._id,
        staffId: selectedStaff,
        paymentMethod: paymentMethod,
      })

      if (paymentMethod === "BANK") {
        setCurrentOrder(order.data)
        setShowBankPayment(true)
      } else {
        setShowSuccess(true)
        setCartItems([])
        setSelectedVariations({})
        handleRemoveDiscount()
        fetchProducts()
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      }

    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowSuccess(true)
    setCartItems([])
    setSelectedVariations({})
    handleRemoveDiscount()
    fetchProducts()
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }



  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal - discountValue
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  const getAvailableColors = (variations) => {
    if (!variations || variations.length === 0) return []
    return [...new Set(variations.filter(v => v.stock > 0).map(v => v.color))]
  }

  const getAvailableSizes = (variations, selectedColor) => {
    if (!variations || variations.length === 0) return []
    const filteredVariations = selectedColor
      ? variations.filter(v => v.color === selectedColor && v.stock > 0)
      : variations.filter(v => v.stock > 0)
    return [...new Set(filteredVariations.map(v => v.size))]
  }

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen from-pink-50 to-purple-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bán hàng tại chỗ (POS)
          </h1>
          <p className="">Quản lý bán hàng trực tiếp tại cửa hàng</p>
        </div>

        {/* Staff & Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Staff Selection */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhân viên bán hàng *
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Chọn nhân viên...</option>
              {staffList.map(staff => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} - {staff.email}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Selection */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách hàng (tùy chọn)
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.target.value)
                  setSelectedCustomer(customer || null)
                }}
                className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Khách vãng lai</option>
                {customers?.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Thêm
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-500 to-purple-600">
                <h2 className="text-xl font-semibold text-white mb-4">Danh sách sản phẩm</h2>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-black pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 text-black bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
                  >
                    <FunnelIcon className="w-5 h-5" />
                    Lọc
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-3 py-2 text-black rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90"
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Còn hàng">Còn hàng</option>
                        <option value="Hết hàng">Hết hàng</option>
                      </select>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="px-3 py-2 text-black rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90"
                      >
                        <option value="">Sắp xếp</option>
                        <option value="name">Tên A-Z</option>
                        <option value="-name">Tên Z-A</option>
                        <option value="sellingPrice">Giá thấp - cao</option>
                        <option value="-sellingPrice">Giá cao - thấp</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-hidden">
                <div className="max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu sắc</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kho</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products?.map((product) => {
                        const selected = selectedVariations[product._id] || {}
                        const hasVariations = product.variations && product.variations.length > 0
                        const availableColors = getAvailableColors(product.variations)
                        const availableSizes = getAvailableSizes(product.variations, selected.color)
                        const availableStock = getAvailableStock(product)

                        return (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {product.mainImage ? (
                                    <img
                                      src={product.mainImage}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <PhotoIcon className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    SKU: {product.sku}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="text-sm">
                                {product.originalPrice > product.sellingPrice && (
                                  <div className="text-xs text-gray-400 line-through">
                                    {product?.originalPrice?.toLocaleString()} ₫
                                  </div>
                                )}
                                <div className="font-semibold text-pink-600">
                                  {product?.sellingPrice?.toLocaleString()} ₫
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              {hasVariations && availableColors.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-32">
                                  {availableColors.map(color => (
                                    <button
                                      key={color}
                                      onClick={() => handleVariationChange(product._id, 'color', color)}
                                      className={`px-2 py-1 text-xs rounded-lg border transition-all duration-200 ${selected.color === color
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300'
                                        }`}
                                    >
                                      {color}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              {hasVariations && availableSizes.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-24">
                                  {availableSizes.map(size => (
                                    <button
                                      key={size}
                                      onClick={() => handleVariationChange(product._id, 'size', size)}
                                      className={`px-2 py-1 text-xs rounded-lg border transition-all duration-200 ${selected.size === size
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300'
                                        }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(hasVariations ? availableStock : product.stock) > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {hasVariations ? availableStock : product.stock}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleAddProduct(product)}
                                disabled={(!hasVariations && product.stock <= 0) || (hasVariations && availableStock <= 0)}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1"
                              >
                                <PlusIcon className="w-4 h-4" />
                                Thêm
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {totalPage > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                      <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      >
                        ← Trước
                      </button>

                      {Array.from({ length: totalPage }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`px-3 py-1 border rounded-lg font-semibold ${page === i + 1 ? "bg-pink-600 text-white" : "bg-white hover:bg-gray-100"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPage))}
                        disabled={page === totalPage}
                        className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      >
                        Sau →
                      </button>
                    </div>
                  )}


                  {products.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm</div>
                      <div className="text-gray-500 text-sm">Thử tìm kiếm với từ khóa khác</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <CartSidebar
              cartItems={cartItems}
              selectedCustomer={selectedCustomer}
              itemCount={itemCount}
              subtotal={subtotal}
              discountValue={discountValue}
              total={total}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isProcessing={isProcessing}
              selectedStaff={selectedStaff}
              onChangeQuantity={handleChangeQuantity}
              onRemoveItem={handleRemove}
              onCheckout={handleCheckout}
              discountType={discountType}
              setDiscountType={setDiscountType}
              discountPercent={discountPercent}
              setDiscountPercent={setDiscountPercent}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              selectedVoucher={selectedVoucher}
              setSelectedVoucher={setSelectedVoucher}
              customerVouchers={customerVouchers}
              setShowVoucherModal={setShowVoucherModal}
              onRemoveDiscount={handleRemoveDiscount}
            />
          </div>
        </div>

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Thêm khách hàng mới</h3>
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Thêm khách hàng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Voucher Modal */}
        <VoucherModal
          show={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
          customerVouchers={customerVouchers}
          selectedVoucher={selectedVoucher}
          onApplyVoucher={handleApplyVoucher}
          staffId={selectedStaff}
        />

        {/* Bank Payment Modal */}
        {showBankPayment && currentOrder && (
          <BankPaymentModal
            order={currentOrder}
            onClose={() => setShowBankPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl transform animate-bounce">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Thanh toán thành công!
                </h3>
                <p className="text-gray-600">
                  Đơn hàng đã được xử lý thành công
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-pink-300::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-pink-300::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .scrollbar-thumb-pink-300::-webkit-scrollbar-thumb {
          background: #f9a8d4;
          border-radius: 3px;
        }
        
        .scrollbar-thumb-pink-300::-webkit-scrollbar-thumb:hover {
          background: #f472b6;
        }
        
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -10px, 0);
          }
          70% {
            transform: translate3d(0, -5px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default PosPage