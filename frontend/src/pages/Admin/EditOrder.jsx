import React, { useState, useEffect } from "react"
import { PencilIcon, PrinterIcon, PaperAirplaneIcon, XMarkIcon, CheckIcon, } from "@heroicons/react/24/outline"
import api from "@/service/api"
import { toast } from "react-toastify"

import OrderProductList from "../../components/adminOrder/OrderProductList"
import OrderSummaryCard from "../../components/adminOrder/OrderSummaryCard"
import OrderCustomerShippingInfo from "../../components/adminOrder/OrderCustomerShippingInfo"

// --- HẰNG SỐ CHUNG ---
const statusOptions = [
    { value: "PENDING", label: "Đang chờ xử lý" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "SHIPPED", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
]

const statusColors = {
    "Đang chờ xử lý": "bg-gray-100 text-gray-600",
    "Đang xử lý": "bg-blue-100 text-blue-600",
    "Đang giao": "bg-yellow-100 text-yellow-600",
    "Hoàn thành": "bg-green-100 text-green-600",
    "Đã hủy": "bg-red-100 text-red-600",
}

const paymentMethods = ["Thanh toán khi nhận hàng (COD)", "Chuyển khoản ngân hàng", "Thẻ tín dụng"]
const shippingTypes = [
    "Giao hàng tiêu chuẩn",
    "Giao hàng hỏa tốc"
]
const initialOrderState = {
    orderId: '', status: 'PENDING', customerInfo: {}, shippingInfo: {}, paymentInfo: {}, productList: [], trackingHistory: [], totals: { subtotal: 0, shippingFee: 0, discount: 0, total: 0 }
}

export const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) return "0₫"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", }).format(amount)
}

// Hàm tính toán tổng tiền trên Frontend
export const calculateTotals = (products, fixedTotals) => {
    const subtotal = products.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0)
    // Giữ lại phí vận chuyển và giảm giá từ API để hiển thị nhất quán
    const shippingFee = fixedTotals?.shippingFee || 0
    const discount = fixedTotals?.discount || 0
    const total = subtotal + shippingFee - discount
    return { subtotal, shippingFee, discount, total }
}
const OrderEditPage = ({ orderId }) => {
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedOrder, setEditedOrder] = useState(initialOrderState)
    const [originalOrder, setOriginalOrder] = useState(initialOrderState)
    const [isLoading, setIsLoading] = useState(true)
    const canEditFull = editedOrder.status === 'PENDING' || editedOrder.status === 'PROCESSING'
    const canEditProductList = editedOrder.status !== 'COMPLETED' && editedOrder.status !== 'CANCELLED'
    const fetchOrder = async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/orders/${orderId}/detail`)
            const order = res.data
            const mapped = {
                _id: order._id, // Giữ lại _id để gửi API
                orderId: order._id,
                status: order.status,
                customerInfo: {
                    name: order.shippingInfo.name,
                    phone: order.shippingInfo.phone,
                    email: order.user?.email || "",
                    address: order.shippingInfo.address,
                },
                shippingInfo: {
                    type: order.shippingMethod === "HOA_TOC" ? "Giao hàng hỏa tốc" : "Giao hàng tiêu chuẩn",
                    note: order.note || "",
                },
                paymentInfo: {
                    method: order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : order.paymentMethod,
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
                trackingHistory: (order.orderHistory || []).map((h) => ({
                    date: new Date(h.changedAt).toLocaleString("vi-VN"),
                    note: h.note,
                })),
                editHistory: (order.editHistory || []).map((edit) => ({
                    editedAt: edit.editedAt,
                    changes: edit.changes,
                })),
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
        if (orderId) {
            fetchOrder() // Gọi API lấy thông tin đơn hàng
        }
    }, [orderId])

    useEffect(() => {
        if (editedOrder.shippingInfo.type === "Giao hàng hỏa tốc") {
            setEditedOrder((prev) => ({
                ...prev,
                totals: { ...prev.totals, shippingFee: 50000 },
            }))
        } else {
            setEditedOrder((prev) => ({
                ...prev,
                totals: { ...prev.totals, shippingFee: 30000 },
            }))
        }
    }, [editedOrder.shippingInfo.type])


    // 🔥 HÀM LƯU ĐƠN HÀNG
    const handleSaveClick = async () => {
        if (!canEditFull && !canEditProductList) {
            toast.error("Trạng thái đơn hàng này không cho phép chỉnh sửa.")
            return
        }

        try {
            const updateData = {
                status: editedOrder.status,
                voucherCode: canEditFull ? editedOrder.paymentInfo.voucher : originalOrder.paymentInfo.voucher, // Chỉ cho sửa voucher khi canEditFull
                note: editedOrder.shippingInfo.note,
                shippingMethod: editedOrder.shippingInfo.type.includes("hỏa tốc") ? "HOA_TOC" : "NHANH",
                paymentMethod: editedOrder.paymentInfo.method.includes("COD") ? "COD" : editedOrder.paymentInfo.method,
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

            const res = await api.patch(`/orders/${editedOrder._id}/edit`, updateData)
            // Sau khi backend tính toán lại, fetch lại dữ liệu mới nhất
            fetchOrder()
            setIsEditMode(false)
            toast.success("Cập nhật đơn hàng thành công 🎉")
        } catch (err) {
            console.error("Lỗi khi lưu đơn hàng:", err)
            toast.error(err.response?.data?.message || "Lỗi khi lưu đơn hàng")
        }
    }

    const handleCancelClick = () => {
        setEditedOrder(originalOrder)
        setIsEditMode(false)
    }

    // Hàm chung cho các trường đơn giản
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


    if (isLoading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
    if (!editedOrder || !editedOrder.orderId) return <div className="p-8 text-center text-red-600">Không tìm thấy đơn hàng</div>

    const currentTotals = calculateTotals(editedOrder.productList, originalOrder.totals)
    const statusObj = statusOptions.find(s => s.value === editedOrder.status || s.label === editedOrder.status)
    const currentStatusLabel = statusObj ? statusObj.label : String(editedOrder.status || "")

    // --- RENDERING SUB-COMPONENTS ---
    const renderEditableField = (label, name, value, inputType = "text", options = [], disabled = false) => (
        <div className="flex-1 space-y-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-500">{label}</label>
            {isEditMode && !disabled ? (
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
                <p className="font-semibold text-gray-800 break-words">{value || 'N/A'}</p>
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
                    <button onClick={() => setIsEditMode(true)} className="flex items-center space-x-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition-colors">
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


    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased p-8">
            <div className="max-w-full mx-auto space-y-10">
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
                            {isEditMode && canEditFull ? (
                                <select
                                    value={editedOrder.status}
                                    onChange={(e) => setEditedOrder({ ...editedOrder, status: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full font-semibold text-sm ${statusColors[currentStatusLabel] || "bg-gray-100 text-gray-600"}`}>
                                        {currentStatusLabel}
                                    </span>
                                    <span className="text-sm text-gray-500">#{editedOrder.orderId}</span>
                                </div>
                            )}
                        </div>

                        {/* Customer & Shipping Info */}
                        <OrderCustomerShippingInfo
                            editedOrder={editedOrder}
                            handleChange={handleChange}
                            isEditMode={isEditMode}
                            canEditFull={canEditFull}
                            renderEditableField={renderEditableField}
                            paymentMethods={paymentMethods}
                            shippingTypes={shippingTypes}
                        />

                        {/* Product List */}
                        <OrderProductList
                            editedOrder={editedOrder}
                            setEditedOrder={setEditedOrder}
                            isEditMode={isEditMode}
                            canEditProductList={canEditProductList}
                            canEditFull={canEditFull}
                            fetchOrder={fetchOrder}
                        />

                        {/* Note section */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ghi chú của khách</h2>
                            {renderEditableField("Ghi chú", "shippingInfo.note", editedOrder.shippingInfo.note)}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Order Summary */}
                        <OrderSummaryCard
                            totals={currentTotals}
                            trackingHistory={editedOrder.trackingHistory || []}
                            editHistory={editedOrder.editHistory || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderEditPage