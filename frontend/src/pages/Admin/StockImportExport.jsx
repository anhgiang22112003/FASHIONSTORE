import apiAdmin from '@/service/apiAdmin'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Package, TrendingUp, TrendingDown, RefreshCw, X, Plus, ShoppingCart, Truck, FileText } from 'lucide-react'
import QuickCreateProduct from '@/components/QuickCreateProduct'

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export default function StockImportExport({ tab, onSuccess }) {
    // Product search
    const [products, setProducts] = useState([])
    const [q, setQ] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const debouncedQ = useDebounce(q, 500)
    const [cartItems, setCartItems] = useState([])
    const [color, setColor] = useState('')
    const [size, setSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [note, setNote] = useState('')
    const [suppliers, setSuppliers] = useState([])
    const [selectedSupplier, setSelectedSupplier] = useState(null)
    const [saving, setSaving] = useState(false)
    const [showAddVariant, setShowAddVariant] = useState(false)
    const [newColor, setNewColor] = useState('')
    const [newSize, setNewSize] = useState('')
    const [newStock, setNewStock] = useState(0)
    const [showQuickCreate, setShowQuickCreate] = useState(false)

    useEffect(() => {
        fetchSuppliers()
    }, [])

    useEffect(() => {
        if (debouncedQ.trim()) {
            searchProducts(debouncedQ)
        } else {
            setProducts([])
        }
    }, [debouncedQ])

    async function fetchSuppliers() {
        try {
            const res = await apiAdmin.get('/supplier')
            setSuppliers(res.data.data || [])
        } catch (e) {
            console.error(e)
        }
    }

    async function addVariant() {
        if (!selectedProduct) return toast.error("Chưa chọn sản phẩm")

        try {
            const res = await apiAdmin.post(`/stock/${selectedProduct._id}/add-variant`, {
                color: newColor,
                size: newSize,
                stock: newStock
            })

            toast.success("Đã thêm biến thể")

            // cập nhật FE ngay
            setSelectedProduct(res.data.product)

            setShowAddVariant(false)
            setNewColor('')
            setNewSize('')
            setNewStock(0)

        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi thêm biến thể")
        }
    }

    async function searchProducts(term) {
        if (!term.trim()) {
            setProducts([])
            return
        }
        setSearchLoading(true)
        try {
            const res = await apiAdmin.get('/products?search=' + encodeURIComponent(term))
            setProducts(res.data.products || [])
        } catch (e) {
            console.error(e)
            toast.error('Lỗi khi tìm kiếm sản phẩm')
        } finally {
            setSearchLoading(false)
        }
    }

    function onPickProduct(p) {
        setSelectedProduct(p)
        setColor('')
        setSize('')
        // if product has only one variant, preselect
        if (p?.variations?.length === 1) {
            setColor(p.variations[0].color)
            setSize(p.variations[0].size)
        }
    }

    function addToCart() {
        if (!selectedProduct) return toast.info('Vui lòng chọn sản phẩm')
        if (!color || !size) return toast.info('Vui lòng chọn biến thể (màu/size)')

        const existingIndex = cartItems.findIndex(
            item => item.productId === selectedProduct._id && item.color === color && item.size === size
        )

        if (existingIndex >= 0) {
            const updated = [...cartItems]
            updated[existingIndex].quantity += Number(quantity)
            setCartItems(updated)
            toast.success('Đã cập nhật số lượng trong giỏ')
        } else {
            setCartItems([
                ...cartItems,
                {
                    productId: selectedProduct._id,
                    productName: selectedProduct.name,
                    sku: selectedProduct.sku,
                    color,
                    size,
                    quantity: Number(quantity),
                }
            ])
            toast.success('Đã thêm vào giỏ')
        }

        // Reset variant fields
        setColor('')
        setSize('')
        setQuantity(1)
    }

    function removeFromCart(index) {
        setCartItems(cartItems.filter((_, i) => i !== index))
    }

    function updateCartQuantity(index, newQty) {
        const updated = [...cartItems]
        updated[index].quantity = Math.max(1, Number(newQty))
        setCartItems(updated)
    }

    async function submitImport(e) {
        e.preventDefault()
        if (cartItems.length === 0) return toast.info('Vui lòng thêm sản phẩm vào giỏ')
        if (!selectedSupplier) return toast.info('Chọn nhà cung cấp')

        setSaving(true)
        try {
            const body = {
                supplierId: selectedSupplier._id,
                note,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                }))
            }
            await apiAdmin.post('/stock/import', body)
            toast.success('Nhập kho thành công')
            resetForm()
            if (onSuccess) onSuccess()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi nhập kho')
        } finally {
            setSaving(false)
        }
    }

    async function submitExport(e) {
        e.preventDefault()
        if (cartItems.length === 0) return toast.info('Vui lòng thêm sản phẩm vào giỏ')

        setSaving(true)
        try {
            const body = {
                note,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                }))
            }
            await apiAdmin.post('/stock/export', body)
            toast.success('Xuất kho thành công')
            resetForm()
            if (onSuccess) onSuccess()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xuất kho')
        } finally {
            setSaving(false)
        }
    }

    function resetForm() {
        setSelectedProduct(null)
        setProducts([])
        setQ('')
        setColor('')
        setSize('')
        setQuantity(1)
        setNote('')
        setSelectedSupplier(null)
        setCartItems([])
    }

    return (
        <div className="min-h-screen  from-slate-50 via-white to-blue-50 ">
            <div className="max-w-full mx-auto">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Panel - Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                            <div className={`p-3 rounded-xl shadow-lg ${tab === 'import' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                                {tab === 'import' ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {tab === 'import' ? 'Nhập kho' : 'Xuất kho'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {tab === 'import' ? 'Thêm sản phẩm vào kho hàng' : 'Xuất sản phẩm khỏi kho'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={tab === 'import' ? submitImport : submitExport}>
                            {/* Product Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-blue-600" />
                                    Tìm kiếm sản phẩm
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        className="w-full text-slate-800 pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                                        value={q}
                                        onChange={e => setQ(e.target.value)}
                                        placeholder="Nhập tên hoặc SKU sản phẩm..."
                                    />
                                    
                                    {searchLoading && (
                                        <RefreshCw className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
                                    )}
                                </div>
                                <button
                                        type="button"
                                        className="px-4 mt-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                                        onClick={() => setShowQuickCreate(true)}
                                    >
                                        Thêm sản phẩm mới
                                    </button>

                                {/* Search Results */}
                                {q && (
                                    <div className="mt-3 max-h-72 overflow-auto border-2 border-slate-200 rounded-xl bg-white shadow-lg">
                                        {searchLoading ? (
                                            <div className="p-6 text-center text-slate-500">
                                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                                                <p className="font-medium">Đang tìm kiếm...</p>
                                            </div>
                                        ) : products.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500">
                                                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                                <p className="font-medium">Không tìm thấy sản phẩm</p>
                                            </div>
                                        ) : (
                                            products.map((p) => (
                                                <div
                                                    key={p._id}
                                                    className={`p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-all ${selectedProduct?._id === p._id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''}`}
                                                    onClick={() => onPickProduct(p)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-slate-800">{p.name}</div>
                                                            <div className="text-xs text-slate-500 mt-1 font-medium">SKU: {p.sku}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                                                Tồn: {p.stock ?? 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedProduct && (
                                <>
                                    {/* Variant Selection */}
                                    <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-base font-bold text-slate-800 flex items-center gap-2">
                                                <Package className="w-5 h-5 text-purple-600" />
                                                Chọn biến thể sản phẩm
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddVariant(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                            >
                                                <Plus className="w-4 h-4" /> Thêm biến thể
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                                    Màu sắc
                                                </label>
                                                <select
                                                    value={color}
                                                    onChange={e => setColor(e.target.value)}
                                                    className="w-full px-4 py-3.5 text-slate-800 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none cursor-pointer font-medium hover:border-slate-300 shadow-sm"
                                                >
                                                    <option value="" className="text-slate-400">Chọn màu sắc</option>
                                                    {[...new Set(selectedProduct.variations?.map(v => v.color))].map((c, i) => (
                                                        <option key={i} value={c} className="text-slate-800">{c}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-[42px] pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                                    Kích thước
                                                </label>
                                                <select
                                                    value={size}
                                                    onChange={e => setSize(e.target.value)}
                                                    className="w-full px-4 py-3.5 text-slate-800 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none cursor-pointer font-medium hover:border-slate-300 shadow-sm"
                                                >
                                                    <option value="" className="text-slate-400">Chọn kích thước</option>
                                                    {[...new Set(selectedProduct.variations?.map(v => v.size))].map((s, i) => (
                                                        <option key={i} value={s} className="text-slate-800">{s}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-[42px] pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-3">
                                            Số lượng
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={quantity}
                                            onChange={e => setQuantity(Number(e.target.value))}
                                            className="w-32 text-slate-800 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-center"
                                        />
                                    </div>

                                    {/* Add to Cart Button */}
                                    <div className="mb-6">
                                        <button
                                            type="button"
                                            onClick={addToCart}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Thêm vào giỏ
                                        </button>
                                    </div>

                                    {/* Supplier (Import only) */}
                                    {tab === 'import' && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-green-600" />
                                                Nhà cung cấp *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedSupplier?._id || ''}
                                                    onChange={e => setSelectedSupplier(suppliers.find(s => s._id === e.target.value))}
                                                    className="w-full text-slate-800 px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none appearance-none cursor-pointer font-medium"
                                                >
                                                    <option value="">Chọn nhà cung cấp</option>
                                                    {suppliers.map((s) => (
                                                        <option value={s._id} key={s._id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Note */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-600" />
                                            Ghi chú
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none font-medium"
                                            placeholder="Thêm ghi chú (tùy chọn)..."
                                        />
                                    </div>

                                    {/* Cart Items Display */}
                                    {cartItems.length > 0 && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <ShoppingCart className="w-4 h-4 text-blue-600" />
                                                Giỏ hàng
                                                <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                    {cartItems.length} sản phẩm
                                                </span>
                                            </label>
                                            <div className="border-2 border-slate-200 rounded-xl max-h-72 overflow-auto bg-slate-50">
                                                {cartItems.map((item, index) => (
                                                    <div key={index} className="p-4 bg-white border-b last:border-b-0 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-sm text-slate-800">{item.productName}</div>
                                                            <div className="text-xs text-slate-500 mt-1 font-medium">{item.color} / {item.size}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={item.quantity}
                                                                onChange={e => updateCartQuantity(index, e.target.value)}
                                                                className="w-20 text-slate-800 px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-bold text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none ${tab === 'import'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                                : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                                                }`}
                                        >
                                            {saving ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    {tab === 'import' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                    {tab === 'import' ? 'Nhập kho' : 'Xuất kho'}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>

                    {/* Right Panel - Product Details */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            Chi tiết sản phẩm
                        </h3>
                        {!selectedProduct ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-12 h-12 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">Chọn sản phẩm để xem chi tiết</p>
                                <p className="text-slate-400 text-sm mt-2">Tìm kiếm và chọn sản phẩm bên trái</p>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-6 pb-6 border-b border-slate-200">
                                    <h4 className="text-lg font-bold text-slate-800 mb-3">{selectedProduct.name}</h4>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="bg-slate-100 px-4 py-2 text-slate-700 rounded-xl font-bold text-sm">
                                            SKU: {selectedProduct.sku}
                                        </span>
                                        <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
                                            Tồn kho: {selectedProduct.stock ?? 0}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Danh sách biến thể
                                    </h5>
                                    <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
                                        {selectedProduct.variations?.map((v, i) => (
                                            <div
                                                key={i}
                                                className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-bold text-slate-800 mb-2">
                                                            {v.color} / {v.size}
                                                        </div>
                                                        <div className="flex gap-3 text-xs">
                                                            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold">
                                                                Tồn: {v.stock}
                                                            </span>
                                                            <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-bold">
                                                                Khóa: {v.lockedStock}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Variant Modal */}
            {showAddVariant && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border-2 border-slate-200 transform transition-all">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-blue-600" />
                                Thêm biến thể mới
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Màu sắc</label>
                                <input
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 font-medium"
                                    placeholder="VD: Đỏ"
                                    value={newColor}
                                    onChange={e => setNewColor(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Kích thước</label>
                                <input
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 font-medium"
                                    placeholder="VD: M"
                                    value={newSize}
                                    onChange={e => setNewSize(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tồn kho ban đầu</label>
                                <input
                                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800 font-bold"
                                    placeholder="0"
                                    type="number"
                                    value={newStock}
                                    onChange={e => setNewStock(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex gap-3">
                            <button
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                onClick={addVariant}
                            >
                                Thêm biến thể
                            </button>
                            <button
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                                onClick={() => setShowAddVariant(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showQuickCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-[700px] max-h-[90vh] overflow-auto">
                        <QuickCreateProduct
                        setShowQuickCreate={setShowQuickCreate}
                            onSuccess={product => {
                                toast.success('Đã thêm sản phẩm mới')
                                setSelectedProduct(product)
                                setProducts(prev => [product, ...prev])
                                setShowQuickCreate(false)
                            }}
                        />
                    </div>
                </div>
            )}

        </div>
    )
}
