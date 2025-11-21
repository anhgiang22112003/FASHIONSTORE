import apiAdmin from '@/service/apiAdmin'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Package, TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react'

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

    // Debounced search
    const debouncedQ = useDebounce(q, 500)

    // Cart items for batch import/export
    const [cartItems, setCartItems] = useState([])

    // variant fields for adding to cart
    const [color, setColor] = useState('')
    const [size, setSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [note, setNote] = useState('')

    // suppliers (only for import)
    const [suppliers, setSuppliers] = useState([])
    const [selectedSupplier, setSelectedSupplier] = useState(null)

    const [saving, setSaving] = useState(false)

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
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <form onSubmit={tab === 'import' ? submitImport : submitExport}>
                    {/* Product Search */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tìm kiếm sản phẩm
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                placeholder="Nhập tên hoặc SKU sản phẩm..."
                            />
                            {searchLoading && (
                                <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
                            )}
                        </div>

                        {/* Search Results */}
                        {q && (
                            <div className="mt-3 max-h-64 overflow-auto border-2 border-slate-200 rounded-lg bg-white shadow-sm">
                                {searchLoading ? (
                                    <div className="p-4 text-center text-slate-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Đang tìm kiếm...
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500">
                                        Không tìm thấy sản phẩm
                                    </div>
                                ) : (
                                    products.map((p) => (
                                        <div
                                            key={p._id}
                                            className={`p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors ${selectedProduct?._id === p._id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                                                }`}
                                            onClick={() => onPickProduct(p)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-slate-800">{p.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">SKU: {p.sku}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-slate-600">
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
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Chọn biến thể
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={color}
                                        onChange={e => setColor(e.target.value)}
                                        className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    >
                                        <option value="">Chọn màu</option>
                                        {[...new Set(selectedProduct.variations?.map(v => v.color))].map((c, i) => (
                                            <option key={i} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={size}
                                        onChange={e => setSize(e.target.value)}
                                        className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    >
                                        <option value="">Chọn size</option>
                                        {[...new Set(selectedProduct.variations?.map(v => v.size))].map((s, i) => (
                                            <option key={i} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Số lượng
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    className="w-32 px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                />
                            </div>

                            {/* Add to Cart Button */}
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={addToCart}
                                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all shadow-md"
                                >
                                    Thêm vào giỏ
                                </button>
                            </div>

                            {/* Supplier (Import only) */}
                            {tab === 'import' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nhà cung cấp
                                    </label>
                                    <select
                                        value={selectedSupplier?._id || ''}
                                        onChange={e => setSelectedSupplier(suppliers.find(s => s._id === e.target.value))}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                    >
                                        <option value="">Chọn nhà cung cấp</option>
                                        {suppliers.map((s) => (
                                            <option value={s._id} key={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Note */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Ghi chú
                                </label>
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                                    placeholder="Thêm ghi chú (tùy chọn)..."
                                />
                            </div>

                            {/* Cart Items Display */}
                            {cartItems.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Giỏ hàng ({cartItems.length} sản phẩm)
                                    </label>
                                    <div className="border-2 border-slate-200 rounded-lg max-h-64 overflow-auto">
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-slate-800">{item.productName}</div>
                                                    <div className="text-xs text-slate-500">{item.color} / {item.size}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={e => updateCartQuantity(index, e.target.value)}
                                                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
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
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${tab === 'import'
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
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
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>

            {/* Right Panel - Product Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-500" />
                    Chi tiết sản phẩm
                </h3>
                {!selectedProduct ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Chọn sản phẩm để xem chi tiết</p>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 pb-4 border-b">
                            <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedProduct.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="bg-slate-100 px-3 py-1 rounded-full">SKU: {selectedProduct.sku}</span>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                                    Tồn kho: {selectedProduct.stock ?? 0}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-semibold text-slate-700 mb-3">Danh sách biến thể</h5>
                            <div className="space-y-2 max-h-96 overflow-auto">
                                {selectedProduct.variations?.map((v, i) => (
                                    <div
                                        key={i}
                                        className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium text-slate-800">
                                                    {v.color} / {v.size}
                                                </div>
                                                <div className="flex gap-4 mt-1 text-xs text-slate-600">
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                                        Tồn: {v.stock}
                                                    </span>
                                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
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
    )
}