import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'
import { X, Plus, Package, Tag, DollarSign, Palette } from 'lucide-react'

export default function QuickCreateProduct({ setShowQuickCreate, onSuccess }) {
    const [Id, setId] = useState('')
    const [sku, setSku] = useState('')
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [collection, setCollection] = useState('')
    const [originalPrice, setOriginalPrice] = useState(0)
    const [sellingPrice, setSellingPrice] = useState(0)
    const [material, setMaterial] = useState('')
    const [brand, setBrand] = useState('')
    const [origin, setOrigin] = useState('')

    const [variants, setVariants] = useState([])
    const [newVariant, setNewVariant] = useState({ color: '', size: '', stock: 0 })

    const [saving, setSaving] = useState(false)

    // New states for categories and collections
    const [categories, setCategories] = useState([])
    const [collections, setCollections] = useState([])

    // Fetch categories and collections on component mount
    useEffect(() => {
        fetchFiltersData()
    }, [])

    const fetchFiltersData = async () => {
        try {
            const [cats, cols] = await Promise.all([
                apiAdmin.get("/categories"),
                apiAdmin.get("/collection"),
            ])
            setCategories(cats.data.data || [])
            setCollections(cols.data.data || [])
        } catch (err) {
            console.error("Lỗi tải danh mục hoặc bộ sưu tập:", err)
            toast.error("Không thể tải danh mục và bộ sưu tập")
        }
    }

    function addVariant() {
        if (!newVariant.color || !newVariant.size) return toast.info('Vui lòng nhập color và size')
        setVariants([...variants, newVariant])
        setNewVariant({ color: '', size: '', stock: 0 })
    }

    function removeVariant(index) {
        setVariants(variants.filter((_, i) => i !== index))
    }

    async function submitForm(e) {
        e.preventDefault()
        if (!Id || !sku || !name || !category || !collection || !originalPrice || !sellingPrice) {
            return toast.info('Vui lòng điền đầy đủ thông tin sản phẩm')
        }
        if (variants.length === 0) return toast.info('Vui lòng thêm ít nhất 1 biến thể')

        setSaving(true)
        try {
            const body = {
                Id,
                sku,
                name,
                category,
                collection,
                originalPrice,
                sellingPrice,
                material,
                brand,
                origin,
                variations: variants
            }
            const res = await apiAdmin.post('/stock/quick-create', body)
            if (onSuccess) onSuccess(res.data.product)
            resetForm()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi tạo sản phẩm')
        } finally {
            setSaving(false)
        }
    }

    function resetForm() {
        setId('')
        setSku('')
        setName('')
        setCategory('')
        setCollection('')
        setOriginalPrice(0)
        setSellingPrice(0)
        setMaterial('')
        setBrand('')
        setOrigin('')
        setVariants([])
        setNewVariant({ color: '', size: '', stock: 0 })
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={() => setShowQuickCreate(false)}
        >
            <div
                className="max-w-4xl w-full mx-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 rounded-2xl shadow-xl relative max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                    <Package className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Thêm sản phẩm nhanh
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">Tạo sản phẩm mới với đầy đủ thông tin và biến thể</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submitForm} className="space-y-6">
                            {/* Basic Info Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                                <div className="flex items-center gap-2 mb-5">
                                    <Tag className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Mã sản phẩm *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="VD: PR0001"
                                            value={Id}
                                            onChange={e => setId(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            SKU *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Mã SKU"
                                            value={sku}
                                            onChange={e => setSku(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="relative md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Tên sản phẩm *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên sản phẩm"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Danh mục *
                                        </label>
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer font-medium"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
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
                                            Bộ sưu tập *
                                        </label>
                                        <select
                                            value={collection}
                                            onChange={e => setCollection(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer font-medium"
                                        >
                                            <option value="">Chọn bộ sưu tập</option>
                                            {collections.map((col) => (
                                                <option key={col._id} value={col._id}>
                                                    {col.name}
                                                </option>
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

                            {/* Pricing Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                                <div className="flex items-center gap-2 mb-5">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Giá bán</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Giá gốc *
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={originalPrice}
                                            onChange={e => setOriginalPrice(Number(e.target.value))}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Giá bán *
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={sellingPrice}
                                            onChange={e => setSellingPrice(Number(e.target.value))}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                                <div className="flex items-center gap-2 mb-5">
                                    <Package className="w-5 h-5 text-purple-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Thông tin bổ sung</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Chất liệu
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="VD: Cotton"
                                            value={material}
                                            onChange={e => setMaterial(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Thương hiệu
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="VD: Nike"
                                            value={brand}
                                            onChange={e => setBrand(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                            Xuất xứ
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="VD: Việt Nam"
                                            value={origin}
                                            onChange={e => setOrigin(e.target.value)}
                                            className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Variants Section */}
                            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-orange-600" />
                                        <h3 className="text-lg font-bold text-slate-800">Biến thể sản phẩm *</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-orange-600 border border-orange-200">
                                        {variants.length} biến thể
                                    </span>
                                </div>

                                {/* Add Variant Form */}
                                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-orange-100">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div className="relative">
                                            <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                                Màu sắc
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="VD: Đỏ"
                                                value={newVariant.color}
                                                onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                                                className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none font-medium"
                                            />
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                                Kích thước
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="VD: M"
                                                value={newVariant.size}
                                                onChange={e => setNewVariant({ ...newVariant, size: e.target.value })}
                                                className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none font-medium"
                                            />
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs font-semibold text-slate-600 mb-2 ml-1">
                                                Tồn kho
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={newVariant.stock}
                                                onChange={e => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                                                className="w-full px-4 py-3 text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none font-medium"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={addVariant}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Thêm
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Variants List */}
                                {variants.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-600 mb-3 ml-1">Danh sách biến thể đã thêm:</p>
                                        {variants.map((v, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all shadow-sm"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg text-orange-600 font-bold text-sm">
                                                        {i + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {v.color} / {v.size}
                                                        </p>
                                                        <p className="text-xs text-slate-500">Tồn kho: {v.stock}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(i)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {saving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Đang lưu...
                                        </span>
                                    ) : (
                                        'Tạo sản phẩm'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowQuickCreate(false)}
                                    className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Đóng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
