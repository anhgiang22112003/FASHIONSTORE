import React, { useEffect, useState } from "react"
import {
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import { formatCurrency } from "../../pages/Admin/EditOrder"
const AddProductToOrder = ({ orderId, fetchOrder, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [results, setResults] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedColor, setSelectedColor] = useState("")
    const [selectedSize, setSelectedSize] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm.trim().length > 1) fetchResults(searchTerm)
            else {
                setResults([])
                setSelectedProduct(null)
            }
        }, 400)
        return () => clearTimeout(delay)
    }, [searchTerm])

    const fetchResults = async (query) => {
        try {
            setLoading(true)
            const res = await apiAdmin.get(`/products/search?query=${encodeURIComponent(query)}`)
            setResults(res.data || [])
        } catch (err) {
            console.error(err)
            toast.error("Không thể tải sản phẩm")
        } finally {
            setLoading(false)
        }
    }

    const handleAddToOrder = async () => {
        if (!selectedProduct || !selectedColor || !selectedSize) {
            toast.error("⚠️ Vui lòng chọn đầy đủ màu, size và số lượng")
            return
        }

        try {
            await apiAdmin.patch(`/orders/${orderId}/add-item`, {
                productId: selectedProduct._id,
                color: selectedColor,
                size: selectedSize,
                quantity,
            })

            toast.success("✅ Đã thêm sản phẩm vào đơn hàng")
            fetchOrder && fetchOrder()
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thêm sản phẩm")
        }
    }

    return (
        <div style={{ color: "var(--text-color)" }} className="  fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg relative">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ×
                </button>

                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Thêm sản phẩm vào đơn hàng
                </h2>
                <div className="relative mb-3">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm sản phẩm..."
                        className="pl-10 pr-3 text-black py-2 border rounded-lg w-full"
                    />
                    {loading && (
                        <div className="absolute right-3 top-2 text-gray-400 text-sm animate-pulse">
                            Đang tìm...
                        </div>
                    )}
                </div>
                {results.length > 0 && !selectedProduct && (
                    <ul className="max-h-48 text-black overflow-y-auto border rounded-md divide-y">
                        {results.map((product) => (
                            <li
                                key={product._id}
                                onClick={() => setSelectedProduct(product)}
                                className={`p-3 cursor-pointer hover:bg-gray-100 rounded-md ${selectedProduct?._id === product._id ? "" : ""
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={product?.mainImage}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-semibold">{product.name}</p>
                                        <p className=" text-sm">
                                            {product?.sellingPrice?.toLocaleString()}đ
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {selectedProduct && (
                    <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 bg-gray-50 p-4 rounded-lg">
                        {/* Thông tin Sản phẩm đã chọn */}
                        <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                            <img
                                src={selectedProduct?.mainImage || "https://placehold.co/64x64/f3f4f6/374151?text=SP"}
                                alt={selectedProduct.name}
                                className="w-14 h-14 object-cover rounded-md shadow-sm"
                            />
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{selectedProduct.name}</h3>
                                <p className="text-pink-600 font-semibold text-sm">
                                    {selectedProduct?.sellingPrice?.toLocaleString()}đ
                                </p>
                            </div>
                        </div>

                        {/* Cấu hình thuộc tính */}
                        <h4 className="font-semibold text-gray-700">Chọn thuộc tính:</h4>

                        {/* Màu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                🎨 Màu sắc:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ...new Set(selectedProduct.variations.map((v) => v.color)),
                                ].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            setSelectedColor(color)
                                            setSelectedSize("") // Reset size khi đổi màu
                                        }}
                                        className={`px-4 py-2 text-sm rounded-lg border transition-all duration-150 ease-in-out ${selectedColor === color
                                            ? "bg-pink-600 text-white border-pink-600 shadow-md transform scale-105"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        {selectedColor ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    📏 Kích cỡ (Tồn kho):
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.variations
                                        .filter((v) => v.color === selectedColor)
                                        .map((v) => (
                                            <button
                                                key={v.size}
                                                onClick={() => setSelectedSize(v.size)}
                                                disabled={v.stock <= 0}
                                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-150 ease-in-out ${v.stock <= 0
                                                    ? "bg-red-50 text-red-400 border-red-300 opacity-70 cursor-not-allowed line-through"
                                                    : selectedSize === v.size
                                                        ? "bg-pink-600 text-white border-pink-600 shadow-md transform scale-105"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer"
                                                    }`}
                                            >
                                                {v.size} ({v.stock})
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic mt-3">Vui lòng chọn Màu sắc để hiển thị Kích cỡ.</p>
                        )}

                        {/* Số lượng */}
                        <div className="flex items-center space-x-3 pt-2">
                            <label className="text-sm font-medium text-gray-600">
                                #️⃣ Số lượng:
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                className="border text-black border-gray-300 rounded-lg px-3 py-1.5 w-24 text-center focus:border-pink-500 focus:ring-pink-500"
                            />
                        </div>

                        {/* Nút thêm */}
                        <button
                            onClick={handleAddToOrder}
                            disabled={!selectedProduct || !selectedColor || !selectedSize || quantity < 1}
                            className="w-full bg-pink-600 text-white py-2.5 rounded-xl font-semibold mt-4 hover:bg-pink-700 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed"
                        >
                            Thêm vào đơn hàng
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const ProductListRow = ({
    editedOrder,
    product,
    index,
    isEditMode,
    handleRemoveProduct,
    canEditFull,
    handleProductChange,
}) => {

    const [confirmDelete, setConfirmDelete] = useState(false)

    const canEditQuantity = isEditMode && canEditFull
    const productName = product.name || product.productName || 'Sản phẩm'
    const productPrice = product.unitPrice || product.price || 0
    const productImage = product.id?.mainImage || product.mainImage || "https://placehold.co/64x64/f3f4f6/374151?text=SP"
    const subTotal = productPrice * product.quantity

    return (
        <div className="flex items-center justify-between space-x-4 border-b border-gray-100 py-4 last:border-b-0">

            {/* Cột 1 & 2: Thông tin Sản phẩm (Gộp lại) */}
            <div className="flex items-center space-x-3 flex-grow min-w-0">
                <img
                    src={productImage}
                    alt={productName}
                    className="w-16 h-16 object-cover rounded-xl shadow-md flex-shrink-0" // Ảnh lớn hơn và bo góc nhiều hơn
                />

                <div className="flex-1 space-y-1 min-w-0">
                    <p className="font-bold text-gray-800 line-clamp-2" title={productName}>
                        {productName}
                    </p>
                    <p className="text-xs text-gray-600 space-x-3">
                        <span>Màu: <span className="font-semibold text-gray-800">{product.color || "N/A"}</span></span>
                        <span>Size: <span className="font-semibold text-gray-800">{product.size || "N/A"}</span></span>
                    </p>

                    {/* Hiển thị Đơn giá ngay dưới thông tin sản phẩm */}
                    <p className="text-xs text-gray-500 pt-1">
                        Đơn giá: <span className="font-medium">{formatCurrency(productPrice)}</span>
                    </p>
                </div>
            </div>

            {/* Cột 3: Số lượng và Thao tác */}
            <div className="flex items-center space-x-4 flex-shrink-0">

                {/* Khu vực Số lượng (Căn giữa) */}
                <div className="flex flex-col items-center">
                    {canEditQuantity ? (
                        <div className="flex items-center space-x-1">
                            <label htmlFor={`qty-${index}`} className="text-xs font-medium text-gray-500">SL:</label>
                            <input
                                id={`qty-${index}`}
                                type="number"
                                name="quantity"
                                min="1"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, e)}
                                className="w-14 text-sm text-center text-gray-700 px-1 py-0.5 rounded-md border border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                            />
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-500">Số lượng</p>
                            <p className="text-base font-semibold text-gray-700">{product.quantity}</p>
                        </>
                    )}
                </div>

                {/* Khu vực Thành tiền */}
                <div className="text-right w-24"> {/* Cố định chiều rộng để căn chỉnh tổng tiền */}
                    <p className="text-xs text-gray-500">Thành tiền</p>
                    <p className="font-bold text-pink-600 text-lg">
                        {formatCurrency(subTotal)}
                    </p>
                </div>

                {isEditMode && ["PENDING", "PROCESSING"].includes(product.status || editedOrder?.status) && (
                    <div className="relative">
                        {/* Nút xóa chính */}
                        <button
                            onClick={() => setConfirmDelete(!confirmDelete)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
                            title="Xóa sản phẩm khỏi đơn hàng"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>

                        {/* Popup xác nhận xóa */}
                        {confirmDelete && (
                            <div
                                className="absolute right-0 top-10 w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-20 animate-fade-in"
                            >
                                <p className="text-sm text-gray-700 text-center font-medium mb-3">
                                    Bạn có chắc muốn xóa sản phẩm này?
                                </p>
                                <div className="flex justify-center space-x-3">
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="px-4 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRemoveProduct(index)
                                            setConfirmDelete(false)
                                        }}
                                        className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div>
    )
}

const OrderProductList = ({
    editedOrder,
    setEditedOrder,
    isEditMode,
    canEditProductList,
    canEditFull,
    fetchOrder,
}) => {
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)

    const handleProductChange = (index, e) => {
        if (!canEditFull) return
        const { name, value } = e.target
        const newProducts = [...editedOrder.productList]
        newProducts[index] = {
            ...newProducts[index],
            [name]: ["quantity", "unitPrice"].includes(name)
                ? parseFloat(value) || 0
                : value,
        }
        setEditedOrder((prev) => ({ ...prev, productList: newProducts }))
    }
    const handleRemoveProduct = async (index) => {
        if (!canEditProductList) return
        const product = editedOrder.productList[index]
        if (!product) return
        try {
            await apiAdmin.delete(`/orders/${editedOrder._id}/item`, {
                params: {
                    productId: product.id._id,
                    color: product.color,
                    size: product.size,
                },
            })

            toast.success("🗑️ Đã xóa sản phẩm khỏi đơn hàng")
            fetchOrder && fetchOrder()
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi đơn hàng")
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Danh sách sản phẩm
            </h2>

            <div className="space-y-4">
                {editedOrder.productList.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                        Đơn hàng chưa có sản phẩm nào.
                    </p>
                ) : (
                    editedOrder.productList.map((product, index) => (
                        <ProductListRow
                            key={`${product._id || product.id}-${index}`}
                            product={product}
                            index={index}
                            isEditMode={isEditMode}
                            handleRemoveProduct={handleRemoveProduct}
                            canEditFull={canEditFull}
                            handleProductChange={handleProductChange}
                            editedOrder={editedOrder}
                        />
                    ))
                )}
            </div>

            {isEditMode && ["PENDING", "PROCESSING"].includes(editedOrder.status) && (
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
                    orderId={editedOrder._id}
                    fetchOrder={fetchOrder}
                    onClose={() => setIsAddProductOpen(false)}
                />
            )}
        </div>
    )
}

export default OrderProductList
