import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  PhotoIcon,
  UserIcon,
  FunnelIcon,
  XMarkIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline"
import { toast } from "react-toastify"
import { QRCodeCanvas } from "qrcode.react"
import { socket } from "@/service/socket"

const BankPaymentModal = ({ order, onClose, onSuccess }) => {
  const [banks, setBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState(null)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await apiAdmin.get("/bank")
        const activeBanks = response.data.filter(b => b.status === true)
        setBanks(activeBanks)
      } catch (err) {
        toast.error("Không tải được danh sách ngân hàng")
      }
    }
    fetchBanks()
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user?.id) return

    socket.emit("join_user", user.id)

    socket.on("user_payment_success", (data) => {
      console.log("Received payment success:", data)

      if (data.order._id === order._id) {
        setIsPaid(true)
        toast.success("Thanh toán thành công qua ngân hàng!")
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      }
    })

    return () => {
      socket.off("user_payment_success")
    }
  }, [order._id, onSuccess, onClose])

  const defaultAccount = {
    name: "Nguyễn Hồng Giang",
    number: "0343887327",
  }

  const info = `don+hang+${order._id}`
  const qrData = `https://img.vietqr.io/image/mbbank-1880115012003-compact2.jpg?addInfo=${info}&amount=${order.total}`

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Thanh toán chuyển khoản</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Danh sách ngân hàng */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Chọn ngân hàng</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {banks.map(bank => (
                <div
                  key={bank._id}
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedBank?._id === bank._id 
                      ? "border-pink-500 bg-pink-50 shadow-md" 
                      : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-gray-800">{bank.name}</div>
                  <div className="text-sm text-gray-600">{bank.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code và thông tin */}
          {selectedBank && (
            <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <img src={qrData} alt="QR Code" className="w-64 h-64 object-contain" />
              </div>
              
              <div className="w-full bg-white rounded-lg p-4 shadow-sm space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chủ tài khoản:</span>
                  <span className="font-semibold text-gray-800">{defaultAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="font-semibold text-gray-800">{defaultAccount.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-pink-600">{order.total?.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Nội dung:</span>
                  <span className="font-semibold text-gray-800 text-right">don hang {order._id}</span>
                </div>
              </div>

              {!isPaid ? (
                <div className="mt-6 flex items-center space-x-3 text-gray-700">
                  <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Đang chờ thanh toán...</span>
                </div>
              ) : (
                <div className="mt-6 flex items-center space-x-2 text-green-600">
                  <CheckIcon className="w-6 h-6" />
                  <span className="font-semibold text-lg">Thanh toán thành công!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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

  // Load danh sách nhân viên
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
        q: searchTerm,
        ...filters
      }
      const res = await apiAdmin.get("/products", { params })
      setProducts(res.data.products || [])
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  // Load danh sách sản phẩm với filters
  useEffect(() => {
    fetchProducts()
  }, [searchTerm, filters])

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

    // Kiểm tra nếu sản phẩm có variations nhưng chưa chọn đủ
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

      // Thêm thông tin variation nếu có
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
        customerId: selectedCustomer?._id
      }

      // Lưu cart POS
      const cart = await apiAdmin.post("/pos/cart", orderData)
      
      // Checkout POS
      const order = await apiAdmin.post("/pos/checkout", {
        cartId: cart.data._id,
        staffId: selectedStaff,
        paymentMethod: paymentMethod,
      })

      // Nếu chọn chuyển khoản, hiển thị modal thanh toán
      if (paymentMethod === "BANK") {
        setCurrentOrder(order.data)
        setShowBankPayment(true)
      } else {
        // Thanh toán tiền mặt thành công ngay
        setShowSuccess(true)
        setCartItems([])
        setSelectedVariations({})
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
    fetchProducts()
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  // Lấy danh sách màu sắc và kích thước unique từ variations có stock > 0
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
      <div className="max-w-7xl mx-auto">
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
          {/* Danh sách sản phẩm - Table Layout */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-500 to-purple-600">
                <h2 className="text-xl font-semibold text-white mb-4">Danh sách sản phẩm</h2>

                {/* Search & Filter Bar */}
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

                {/* Filters */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="px-3 py-2 text-black rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90"
                      >
                        <option value="">Tất cả danh mục</option>
                      </select>
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
                <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100">
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
                      {filteredProducts.map((product) => {
                        const selected = selectedVariations[product._id] || {}
                        const hasVariations = product.variations && product.variations.length > 0
                        const availableColors = getAvailableColors(product.variations)
                        const availableSizes = getAvailableSizes(product.variations, selected.color)
                        const availableStock = getAvailableStock(product)

                        return (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                            {/* Product Info */}
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
                                  {product.isFeatured && (
                                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                                      Nổi bật
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                {product.originalPrice > product.sellingPrice && (
                                  <div className="text-xs text-gray-400 line-through">
                                    {product.originalPrice?.toLocaleString()} ₫
                                  </div>
                                )}
                                <div className="font-semibold text-pink-600">
                                  {product.sellingPrice?.toLocaleString()} ₫
                                </div>
                              </div>
                            </td>

                            {/* Color Selection */}
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

                            {/* Size Selection */}
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

                            {/* Stock */}
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(hasVariations ? availableStock : product.stock) > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {hasVariations ? availableStock : product.stock}
                              </span>
                            </td>

                            {/* Action */}
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

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm</div>
                      <div className="text-gray-500 text-sm">Thử tìm kiếm với từ khóa khác</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Giỏ hàng POS */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-600">
                <div className="flex items-center justify-between text-white">
                  <h2 className="text-xl font-semibold">Giỏ hàng</h2>
                  <div className="flex items-center gap-2">
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                      {itemCount}
                    </span>
                  </div>
                </div>
                {selectedCustomer && (
                  <div className="mt-3 text-white/90 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{selectedCustomer.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Giỏ hàng trống</p>
                    <p className="text-gray-400 text-sm">Thêm sản phẩm để bắt đầu</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100 mb-6">
                      {cartItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:border-pink-300 transition-all duration-200"
                        >
                          <div className="flex gap-3 mb-3">
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.mainImage ? (
                                <img
                                  src={item.mainImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <PhotoIcon className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 text-sm truncate">
                                {item.productName}
                              </h4>
                              <div className="text-xs text-gray-500">
                                {item.price?.toLocaleString()} ₫
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemove(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all duration-200 flex-shrink-0"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleChangeQuantity(idx, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>

                              <input
                                type="number"
                                value={item.quantity}
                                min={1}
                                onChange={(e) => handleChangeQuantity(idx, Number(e.target.value))}
                                className="w-16 text-black text-center py-1 px-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              />

                              <button
                                onClick={() => handleChangeQuantity(idx, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 flex items-center justify-center transition-all duration-200"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold text-pink-600">
                                {(item.price * item.quantity)?.toLocaleString()} ₫
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tổng tiền */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-pink-600">
                          {total?.toLocaleString()} ₫
                        </span>
                      </div>
                    </div>

                    {/* Chọn phương thức thanh toán */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phương thức thanh toán
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPaymentMethod("CASH")}
                          className={`px-4 py-3 text-black rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                            paymentMethod === "CASH"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <CreditCardIcon className="w-5 h-5" />
                          <span className="font-medium">Tiền mặt</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod("BANK")}
                          className={`px-4 py-3 text-black rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                            paymentMethod === "BANK"
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <BanknotesIcon className="w-5 h-5" />
                          <span className="font-medium">Chuyển khoản</span>
                        </button>
                      </div>
                    </div>

                    {/* Nút thanh toán */}
                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing || cartItems.length === 0 || !selectedStaff}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          {paymentMethod === "CASH" ? (
                            <>
                              <CreditCardIcon className="w-5 h-5" />
                              Thanh toán tiền mặt
                            </>
                          ) : (
                            <>
                              <BanknotesIcon className="w-5 h-5" />
                              Thanh toán chuyển khoản
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
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