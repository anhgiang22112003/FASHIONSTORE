import React, { useEffect, useState } from "react"
import apiAdmin from "service/apiAdmin"
import {
  PlusIcon,
  CheckIcon,
  PhotoIcon,
  UserIcon,
  XMarkIcon,
  ComputerDesktopIcon
} from "@heroicons/react/24/outline"
import { toast } from "react-toastify"
import { socket } from "service/socket"
import CartSidebar from "components/CartSidebar"
import VoucherModal from "components/VoucherModal"
import BankPaymentModal from "components/BankPaymentSection"
import BankPaymentPos from "components/BankPaymentPos"
import { PageHeader, Toolbar, FilterPanel, Pagination, AdminButton } from "components/admin/ui"

const PosPage = () => {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedVariations, setSelectedVariations] = useState({})
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [showBankPayment, setShowBankPayment] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)
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
  const [totalProducts, setTotalProducts] = useState(0)
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
      setTotalProducts(res.data.total || 0)
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
    const updateDiscount = async () => {
      if (cartItems.length === 0) return

      const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      let newDiscountValue = 0

      switch (discountType) {
        case "PERCENT":
          newDiscountValue = Math.round(subtotal * discountPercent / 100)
          break
        case "AMOUNT":
          newDiscountValue = Math.min(discountAmount, subtotal)
          break
        case "VOUCHER":
          if (selectedVoucher) {
            if (selectedVoucher.type === "percent") {
              const voucherDiscount = Math.round(subtotal * selectedVoucher.discountValue / 100)
              newDiscountValue = selectedVoucher.maxDiscount
                ? Math.min(voucherDiscount, selectedVoucher.maxDiscount)
                : voucherDiscount
            } else {
              newDiscountValue = selectedVoucher.discountValue
            }
          }
          break
        default:
          newDiscountValue = 0
      }

      setDiscountValue(newDiscountValue)

      // ✅ Gọi API để cập nhật discount
      if (discountType === "VOUCHER" && selectedVoucher) {
        try {
          await apiAdmin.post("/pos/cart/apply-voucher", {
            code: selectedVoucher.code,
            staffId: selectedStaff
          })
        } catch (err) {
          console.error("Error applying voucher:", err)
        }
      } else if (discountType === "PERCENT" || discountType === "AMOUNT") {
        try {
          await apiAdmin.post("/pos/cart/manual-discount", {
            manualDiscount: newDiscountValue,
            staffId: selectedStaff
          })
        } catch (err) {
          console.error("Error applying discount:", err)
        }
      } else {
        // Reset discount nếu NONE
        await updateCartAPI(cartItems)
      }
    }

    updateDiscount()
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

  const handleAddProduct = async (product) => {
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

    let updatedItems
    if (existing) {
      existing.quantity += 1
      updatedItems = [...cartItems]
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

      updatedItems = [...cartItems, newItem]
    }
    setCartItems(updatedItems)
    await updateCartAPI(updatedItems)
  }

  const handleChangeQuantity = async (index, qty) => {
    if (qty <= 0) return

    const updatedItems = [...cartItems]
    updatedItems[index].quantity = qty
    setCartItems(updatedItems)

    // ✅ Gọi API để cập nhật cart
    await updateCartAPI(updatedItems)
  }

  const handleRemove = async (index) => {
    const updatedItems = [...cartItems]
    updatedItems.splice(index, 1)
    setCartItems(updatedItems)

    // ✅ Gọi API để cập nhật cart
    await updateCartAPI(updatedItems)
  }
  const updateCartAPI = async (items) => {
    try {
      await apiAdmin.post("/pos/cart", {
        items,
        staffId: selectedStaff,
        customerId: selectedCustomer?._id,
        discount: discountValue,
      })
      // Socket event sẽ được emit từ backend tự động
    } catch (err) {
      console.error("Error updating cart:", err)
      toast.error("Lỗi khi cập nhật giỏ hàng")
    }
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

  const handleRemoveDiscount = async () => {
    setDiscountType("NONE")
    setDiscountValue(0)
    setDiscountPercent(0)
    setDiscountAmount(0)
    setSelectedVoucher(null)

    // ✅ Gọi API để reset discount
    if (cartItems.length > 0) {
      try {
        await apiAdmin.post("/pos/cart/manual-discount", {
          manualDiscount: 0,
          staffId: selectedStaff
        })
      } catch (err) {
        console.error("Error removing discount:", err)
      }
    }
  }

  const handleCheckout = async () => {
    if (!selectedStaff) {
      toast.info("Vui lòng chọn nhân viên!")
      return
    }

    setIsProcessing(true)
    try {
      // Đảm bảo cart đã được update lần cuối
      const cart = await apiAdmin.post("/pos/cart", {
        items: cartItems,
        staffId: selectedStaff,
        customerId: selectedCustomer?._id,
        discount: discountValue,
      })

      if (paymentMethod === "CASH") {
        socket.emit('customer_checkout', {
          paymentMethod: paymentMethod,
          total: total
        })
      }
      const order = await apiAdmin.post("/pos/checkout", {
        cartId: cart.data._id,
        staffId: selectedStaff,
        paymentMethod: paymentMethod,
      })

      if (paymentMethod === "BANK") {
        setCurrentOrder(order.data)
        setShowBankPayment(true)
      } else {
        // ✅ Emit null để xóa màn hình khách hàng
        socket.emit('customer_cart_update', null)

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
    // ✅ Emit null để xóa màn hình khách hàng
    socket.emit('customer_cart_update', null)

    setShowBankPayment(false)
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
        <PageHeader
          title="Bán hàng tại chỗ (POS)"
          description="Quản lý bán hàng trực tiếp tại cửa hàng"
        >
          <AdminButton
            onClick={() => window.open('/customer-display', '_blank', 'width=1024,height=768,toolbar=no,menubar=no')}
            variant="primary"
            size="md"
          >
            <ComputerDesktopIcon className="w-5 h-5 mr-2" />
            Màn hình khách hàng
          </AdminButton>
        </PageHeader>

        {/* Staff & Customer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Staff Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-2">
              Nhân viên bán hàng *
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 border text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-slate-900"
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
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-2">
              Khách hàng (tùy chọn)
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.target.value)
                  setSelectedCustomer(customer || null)
                }}
                className="flex-1 px-3 py-2 border text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-slate-900"
              >
                <option value="">Khách vãng lai</option>
                {customers?.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
              <AdminButton
                onClick={() => setShowCustomerForm(true)}
                variant="secondary"
                size="sm"
              >
                <UserIcon className="w-4 h-4 mr-1.5" />
                Thêm
              </AdminButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Search & Filter Toolbar */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <Toolbar
                  searchValue={searchTerm}
                  onSearchChange={(val) => setSearchTerm(val)}
                  searchPlaceholder="Tìm kiếm sản phẩm..."
                  onFilterToggle={() => setShowFilters(!showFilters)}
                  filterActive={showFilters}
                  filterCount={Object.values(filters).filter(Boolean).length}
                  actions={
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {totalProducts} sản phẩm
                    </span>
                  }
                />

                <FilterPanel isOpen={showFilters} onReset={() => setFilters({ category: "", collection: "", status: "", minPrice: "", maxPrice: "", sortBy: "" })}>
                  <FilterPanel.Field label="Trạng thái">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="Còn hàng">Còn hàng</option>
                      <option value="Hết hàng">Hết hàng</option>
                    </select>
                  </FilterPanel.Field>

                  <FilterPanel.Field label="Sắp xếp">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                      <option value="">Mặc định</option>
                      <option value="name">Tên A-Z</option>
                      <option value="-name">Tên Z-A</option>
                      <option value="sellingPrice">Giá thấp - cao</option>
                      <option value="-sellingPrice">Giá cao - thấp</option>
                    </select>
                  </FilterPanel.Field>
                </FilterPanel>
              </div>

              {/* Product Grid */}
              <div className="max-h-[680px] overflow-y-auto scrollbar-hidden p-4">
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <PhotoIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-gray-400 font-medium">Không tìm thấy sản phẩm</div>
                    <div className="text-gray-300 text-sm mt-1">Thử tìm kiếm với từ khóa khác</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                    {products.map((product) => {
                      const selected = selectedVariations[product._id] || {}
                      const hasVariations = product.variations && product.variations.length > 0
                      const availableColors = getAvailableColors(product.variations)
                      const availableSizes = getAvailableSizes(product.variations, selected.color)
                      const availableStock = getAvailableStock(product)
                      const isOutOfStock = (hasVariations ? availableStock : product.stock) <= 0

                      return (
                        <div
                          key={product._id}
                          className={`relative bg-white rounded-xl border-2 transition-all duration-200 flex flex-col overflow-hidden group ${
                            isOutOfStock
                              ? 'border-gray-100 opacity-60'
                              : 'border-gray-100 hover:border-pink-300 hover:shadow-md'
                          }`}
                        >
                          {/* Product Image */}
                          <div className="relative w-full h-36 bg-gray-50 flex-shrink-0">
                            {product.mainImage ? (
                              <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon className="w-10 h-10 text-gray-300" />
                              </div>
                            )}
                            {/* Stock badge */}
                            <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isOutOfStock ? 'Hết hàng' : `Còn ${hasVariations ? availableStock : product.stock}`}
                            </span>
                            {product.discount > 0 && (
                              <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                -{product.discount}%
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-3 flex flex-col flex-1">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-0.5">{product.name}</p>
                            <p className="text-xs text-gray-400 mb-2">SKU: {product.sku}</p>

                            {/* Price */}
                            <div className="flex items-baseline gap-1.5 mb-3">
                              <span className="text-base font-bold text-pink-600">{product.sellingPrice?.toLocaleString()}₫</span>
                              {product.originalPrice > product.sellingPrice && (
                                <span className="text-xs text-gray-400 line-through">{product.originalPrice?.toLocaleString()}₫</span>
                              )}
                            </div>

                            {/* Variations */}
                            {hasVariations && (
                              <div className="space-y-1.5 mb-3">
                                {availableColors.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {availableColors.slice(0, 5).map(color => (
                                      <button
                                        key={color}
                                        onClick={() => handleVariationChange(product._id, 'color', color)}
                                        className={`px-2 py-0.5 text-xs rounded-md border transition-all ${
                                          selected.color === color
                                            ? 'bg-pink-500 text-white border-pink-500'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300'
                                        }`}
                                      >
                                        {color}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {availableSizes.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {availableSizes.slice(0, 6).map(size => (
                                      <button
                                        key={size}
                                        onClick={() => handleVariationChange(product._id, 'size', size)}
                                        className={`px-2 py-0.5 text-xs rounded-md border transition-all ${
                                          selected.size === size
                                            ? 'bg-purple-500 text-white border-purple-500'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'
                                        }`}
                                      >
                                        {size}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Add button */}
                            <button
                              onClick={() => handleAddProduct(product)}
                              disabled={isOutOfStock}
                              className="mt-auto w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  page={page}
                  total={totalProducts}
                  limit={20}
                  onPageChange={(p) => setPage(p)}
                />
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
          <BankPaymentPos
            order={currentOrder}
            selectedBank={selectedBank}
            setSelectedBank={setSelectedBank}
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