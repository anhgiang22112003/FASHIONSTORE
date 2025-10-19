import React, { useState, useEffect } from "react"
import {
    PencilIcon,
    PrinterIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    CheckIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import api from "@/service/api"
import { toast } from "react-toastify"
import AddProductToOrder from "./AddProductToOrder"

const statusOptions = [
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "SHIPPED", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
]


const paymentMethods = [
    "Thanh toán khi nhận hàng (COD)",
    "Chuyển khoản ngân hàng",
    "Thẻ tín dụng",
]
const shippingUnits = ["GHN", "GHTK", "J&T Express", "Viettel Post"]
const shippingTypes = [
    "Giao hàng tiêu chuẩn",
    "Giao hàng nhanh",
    "Giao hàng tiết kiệm",
]

const statusColors = {
    "Xác nhận đơn hàng": "bg-gray-100 text-gray-600",
    "Đang xử lý": "bg-blue-100 text-blue-600",
    "Đang giao": "bg-yellow-100 text-yellow-600",
    "Hoàn thành": "bg-green-100 text-green-600",
    "Đã hủy": "bg-red-100 text-red-600",
}

const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "0₫"
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount)
}

const OrderEditPage = ({ orderId }) => {
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedOrder, setEditedOrder] = useState(null)
    const [originalOrder, setOriginalOrder] = useState(null)
    const [isAddingProduct, setIsAddingProduct] = useState(false)
    const [productSearchTerm, setProductSearchTerm] = useState("")
    const [availableProducts, setAvailableProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)


    // ✅ Fetch chi tiết đơn hàng

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${orderId}`)
            const order = res.data

            const mapped = {
                orderId: order._id,
                status: order.status,
                customerInfo: {
                    name: order.shippingInfo.name,
                    phone: order.shippingInfo.phone,
                    email: order.user?.email || "",
                    address: order.shippingInfo.address,
                },
                shippingInfo: {
                    type:
                        order.shippingMethod === "HOA_TOC"
                            ? "Giao hàng hỏa tốc"
                            : "Giao hàng tiêu chuẩn",
                    unit: order.shippingUnit || "GHN",
                    note: order.note || "",
                },
                paymentInfo: {
                    method:
                        order.paymentMethod === "COD"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : order.paymentMethod,
                    voucher: order.voucherCode || "",
                },
                productList: order.items.map((item) => ({
                    id: item.product,
                    name: item.productName,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    image: item.image || "https://placehold.co/100x100",
                })),
                trackingHistory: order.editHistory
                    ? order.editHistory.map((h) => ({
                        date: new Date(h.editedAt).toLocaleString("vi-VN"),
                        note: h.changes,
                    }))
                    : [],
                totals: {
                    subtotal: order.subtotal || 0,
                    shippingFee: order.shipping || 0,
                    discount: order.discount || 0,
                    total: order.total || 0,
                },
            }

            setEditedOrder(mapped)
            setOriginalOrder(mapped)
        } catch (err) {
            console.error("Lỗi khi lấy đơn hàng:", err)
            toast.error("Không thể tải đơn hàng")
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchOrder()
    }, [orderId])

    // ✅ Fetch danh sách sản phẩm có thể thêm
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products")
                const products = res.data.map((p) => ({
                    id: p._id,
                    name: p.name,
                    sku: p.sku || p._id.slice(-6),
                    unitPrice: p.price,
                    image: p.images?.[0] || "https://placehold.co/100x100",
                }))
                setAvailableProducts(products)
            } catch (err) {
                console.error("Lỗi khi lấy danh sách sản phẩm:", err)
            }
        }
        fetchProducts()
    }, [])

    const calculateTotals = (products) => {
        const subtotal = products.reduce(
            (acc, p) => acc + p.unitPrice * p.quantity,
            0
        )
        const shippingFee = editedOrder?.totals?.shippingFee || 0
        const discount = editedOrder?.totals?.discount || 0
        const total = subtotal + shippingFee - discount
        return { subtotal, shippingFee, discount, total }
    }

    const totals = editedOrder ? calculateTotals(editedOrder.productList) : {}

    const handleEditClick = () => setIsEditMode(true)

    const handleSaveClick = async () => {
        try {
            const updateData = {
                status: editedOrder.status,
                note: editedOrder.shippingInfo.note,
                paymentMethod: editedOrder.paymentInfo.method.includes("COD")
                    ? "COD"
                    : editedOrder.paymentInfo.method,
                shippingInfo: {
                    name: editedOrder.customerInfo.name,
                    phone: editedOrder.customerInfo.phone,
                    address: editedOrder.customerInfo.address,
                },
                items: editedOrder.productList.map((p) => ({
                    product: p.id,
                    productName: p.name,
                    price: p.unitPrice,
                    quantity: p.quantity,
                    color: p.color,
                    size: p.size,
                })),
            }

            const res = await api.patch(`/orders/${orderId}/edit`, updateData)
            setEditedOrder(res.data)
            setOriginalOrder(res.data)
            setIsEditMode(false)
            toast.success("Cập nhật đơn hàng thành công 🎉")
        } catch (err) {
            console.error("Lỗi khi lưu đơn hàng:", err)
            toast.error("Không thể lưu thay đổi")
        }
    }

    const handleCancelClick = () => {
        setEditedOrder(originalOrder)
        setIsEditMode(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const [section, field] = name.split(".")
        setEditedOrder((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }))
    }

    const handleProductChange = (index, e) => {
        const { name, value } = e.target
        const newProducts = [...editedOrder.productList]
        newProducts[index] = {
            ...newProducts[index],
            [name]:
                name === "quantity" || name === "unitPrice"
                    ? parseFloat(value) || 0
                    : value,
        }
        setEditedOrder((prev) => ({
            ...prev,
            productList: newProducts,
        }))
    }

    const handleAddProduct = (productToAdd) => {
        const existing = editedOrder.productList.find(
            (p) => p.id === productToAdd.id
        )
        let newList
        if (existing) {
            newList = editedOrder.productList.map((p) =>
                p.id === productToAdd.id ? { ...p, quantity: p.quantity + 1 } : p
            )
        } else {
            newList = [...editedOrder.productList, { ...productToAdd, quantity: 1 }]
        }
        setEditedOrder((prev) => ({ ...prev, productList: newList }))
        setIsAddingProduct(false)
    }

    const handleRemoveProduct = (index) => {
        const newProducts = editedOrder.productList.filter((_, i) => i !== index)
        setEditedOrder((prev) => ({
            ...prev,
            productList: newProducts,
        }))
    }

    const filteredProducts = availableProducts.filter(
        (p) =>
            p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
    )

    if (isLoading) return <div>Đang tải...</div>
    if (!editedOrder) return <div>Không tìm thấy đơn hàng</div>

    const renderEditableField = (label, name, value, inputType = "text", options = []) => (
        <div className="flex-1 space-y-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-500">{label}</label>
            {isEditMode ? (
                options.length > 0 ? (
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    >
                        {options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={inputType}
                        id={name}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                )
            ) : (
                <p className="font-semibold text-gray-800">{value}</p>
            )}
        </div>
    )

    const renderHeaderButtons = () => {
        if (isEditMode) {
            return (
                <div className="flex space-x-2">
                    <button
                        onClick={handleSaveClick}
                        className="flex items-center space-x-1 px-4 py-2 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors"
                    >
                        <CheckIcon className="w-5 h-5" />
                        <span>Lưu thay đổi</span>
                    </button>
                    <button
                        onClick={handleCancelClick}
                        className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                        <span>Hủy bỏ</span>
                    </button>
                </div>
            )
        } else {
            return (
                <div className="flex space-x-2">
                    <button onClick={handleEditClick} className="flex items-center space-x-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition-colors">
                        <PencilIcon className="w-5 h-5" />
                        <span>Chỉnh sửa</span>
                    </button>
                    <button className="flex items-center space-x-1 px-4 py-2 bg-pink-100 text-pink-600 rounded-xl font-semibold hover:bg-pink-200 transition-colors">
                        <PrinterIcon className="w-5 h-5" />
                        <span>In đơn hàng</span>
                    </button>
                    <button className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>Gửi email</span>
                    </button>
                </div>
            )
        }
    }

    const renderStatusSection = () => {
        if (isEditMode) {
            return (
                <select
                    value={editedOrder.status}
                    onChange={(e) =>
                        setEditedOrder({ ...editedOrder, status: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                >
                    {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            )
        } else {
            const current = statusOptions.find(
                (s) => s.value === editedOrder.status
            )
            return (
                <div className="flex items-center space-x-2">
                    <span
                        className={`px-3 py-1 rounded-full font-semibold text-sm ${statusColors[current?.label] || "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {current?.label || editedOrder.status}
                    </span>
                    <span className="text-sm text-gray-500">
                        #{editedOrder.orderId}
                    </span>
                </div>
            )
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased p-8">
            <div className="max-w-full mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
                        <p className="text-gray-500 mt-1">Mã đơn hàng: {editedOrder.orderId}</p>
                    </div>
                    {renderHeaderButtons()}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Section */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái đơn hàng</h2>
                            {renderStatusSection()}
                        </div>

                        {/* Customer & Shipping Info */}
                        <div className="bg-white rounded-2xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách hàng</h2>
                                {renderEditableField("Tên khách hàng", "customerInfo.name", editedOrder.customerInfo.name)}
                                {renderEditableField("Email", "customerInfo.email", editedOrder.customerInfo.email)}
                                {renderEditableField("Số điện thoại", "customerInfo.phone", editedOrder.customerInfo.phone)}
                                {renderEditableField("Địa chỉ giao hàng", "customerInfo.address", editedOrder.customerInfo.address)}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin vận chuyển</h2>
                                {renderEditableField("Đơn vị vận chuyển", "shippingInfo.unit", editedOrder.shippingInfo.unit, "text", shippingUnits)}
                                {renderEditableField("Loại hình vận chuyển", "shippingInfo.type", editedOrder.shippingInfo.type, "text", shippingTypes)}
                                {renderEditableField("Ghi chú vận chuyển", "shippingInfo.note", editedOrder.shippingInfo.note, "textarea")}
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Danh sách sản phẩm</h2>
                            <div className="space-y-4">
                                {editedOrder.productList.map((product, index) => (
                                    <div key={product.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="flex-1 space-y-1">
                                            {isEditMode ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={product.name}
                                                        onChange={(e) => handleProductChange(index, e)}
                                                        className="w-full font-semibold text-gray-800 px-2 py-1 rounded-md border border-gray-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="color"
                                                        placeholder="Màu"
                                                        value={product.color}
                                                        onChange={(e) => handleProductChange(index, e)}
                                                        className="w-full text-sm text-gray-500 px-2 py-1 rounded-md border border-gray-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="size"
                                                        placeholder="Size"
                                                        value={product.size}
                                                        onChange={(e) => handleProductChange(index, e)}
                                                        className="w-full text-sm text-gray-500 px-2 py-1 rounded-md border border-gray-300"
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <label className="text-sm text-gray-500">Số lượng:</label>
                                                        <input
                                                            type="number"
                                                            name="quantity"
                                                            value={product.quantity}
                                                            onChange={(e) => handleProductChange(index, e)}
                                                            className="w-16 text-sm text-gray-500 px-2 py-1 rounded-md border border-gray-300"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-semibold text-gray-800">{product.name}</p>
                                                    <p className="text-sm text-gray-500">Màu: {product.color}, Size: {product.size}</p>
                                                    <p className="text-sm text-gray-500">Số lượng: {product.quantity}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {isEditMode ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        name="unitPrice"
                                                        value={product.unitPrice}
                                                        onChange={(e) => handleProductChange(index, e)}
                                                        className="w-24 text-sm text-gray-500 px-2 py-1 rounded-md border border-gray-300 text-right"
                                                    />
                                                    <button onClick={() => handleRemoveProduct(index)} className="p-1 ml-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-gray-500">Đơn giá: {formatCurrency(product.unitPrice)}</p>
                                                    <p className="font-bold text-pink-600">{formatCurrency(product.unitPrice * product.quantity)}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {isEditMode && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setIsAddProductOpen(true)}
                                        className="flex items-center justify-center space-x-1 px-4 py-2 bg-pink-100 text-pink-600 rounded-xl font-semibold hover:bg-pink-200 transition-colors w-full"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Thêm sản phẩm</span>
                                    </button>
                                </div>
                            )}
                            {isAddProductOpen && (
                                <AddProductToOrder
                                    orderId={orderId}
                                    fetchOrder={fetchOrder}
                                    onClose={() => setIsAddingProduct(false)}
                                />
                            )}

                            {/* Add Product Modal */}
                            {/* {isAddingProduct && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h3 className="text-lg font-bold">Tìm kiếm & Thêm sản phẩm</h3>
                                            <button onClick={() => setIsAddingProduct(false)} className="text-gray-400 hover:text-gray-600">
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm theo tên hoặc SKU..."
                                                value={productSearchTerm}
                                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                                className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            {filteredProducts.map(product => (
                                                <div key={product.id} className="flex items-center justify-between p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAddProduct(product)}>
                                                    <div className="flex items-center space-x-3">
                                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md" />
                                                        <div>
                                                            <p className="font-medium text-gray-800">{product.name}</p>
                                                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-pink-600 font-semibold">{formatCurrency(product.unitPrice)}</p>
                                                </div>
                                            ))}
                                            {filteredProducts.length === 0 && (
                                                <p className="text-center text-gray-500">Không tìm thấy sản phẩm nào.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )} */}

                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin thanh toán</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    {renderEditableField("Phương thức thanh toán", "paymentInfo.method", editedOrder.paymentInfo.method, "text", paymentMethods)}
                                    {renderEditableField("Mã khuyến mãi", "paymentInfo.voucher", editedOrder.paymentInfo.voucher)}
                                </div>
                            </div>
                        </div>

                        {/* Note section */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ghi chú của khách</h2>
                            {renderEditableField("Ghi chú", "shippingInfo.note", editedOrder.shippingInfo.note)}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <p>Tạm tính</p>
                                    <p className="font-medium">{formatCurrency(totals.subtotal)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Phí vận chuyển</p>
                                    <p className="font-medium">{formatCurrency(totals.shippingFee)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Giảm giá</p>
                                    <p className="font-medium text-green-600">-{formatCurrency(totals.discount)}</p>
                                </div>
                                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                                    <p>Tổng cộng</p>
                                    <p className="text-pink-600 text-xl">{formatCurrency(totals.total)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Tracking */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử đơn hàng</h2>
                            <ol className="relative border-l border-gray-200 ml-4">
                                {editedOrder.trackingHistory.map((step, index) => (
                                    <li key={index} className="mb-4 ml-6">
                                        <span className="absolute flex items-center justify-center w-5 h-5 bg-pink-100 rounded-full -left-2.5 ring-4 ring-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM3.465 4.965a1 1 0 00-.707 1.707l1.414 1.414a1 1 0 00.707.293c.264 0 .52-.105.707-.293l1.414-1.414a1 1 0 00-1.707-1.707L3.465 4.965zM12 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM2 9a1 1 0 001 1h1a1 1 0 000-2H3a1 1 0 00-1 1zM19 9a1 1 0 00-1 1h-1a1 1 0 000-2h1a1 1 0 001 1zM12 19a1 1 0 00-1-1v-1a1 1 0 002 0v1a1 1 0 00-1 1zM5.536 17.536a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 00.293 1.707zM17.536 5.536a1 1 0 00.293-.707l-1.414-1.414a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 00.707-.293z" /></svg>
                                        </span>
                                        <p className="text-gray-500 text-sm font-medium">{step.date}</p>
                                        <p className="font-semibold text-gray-800">{step.note}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default OrderEditPage
