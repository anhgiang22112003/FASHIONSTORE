import React, { useEffect, useMemo, useState } from "react"
import { PencilIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, EyeIcon } from "@heroicons/react/24/outline"
import DeleteProductModal from "../../components/DeleteProductPopup"
import { toast } from "react-toastify"
import ShowImportModal from "../../components/ShowImportModal"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import debounce from "lodash.debounce"
import ConfirmBulkDeleteModal from "@/components/ConfirmBulkDeleteModal"
import apiAdmin from "@/service/apiAdmin"
import Switch from "@/components/ui/switch"

const statusColors = {
    "Còn hàng": "bg-green-100 text-green-600",
    "Hết hàng": "bg-red-100 text-red-600",
    "Ngừng bán": "bg-blue-100 text-blue-600",
}

// Hàm định dạng tiền tệ
const formatCurrency = (number) => {
    if (number === "" || number === null || isNaN(Number(number))) return ""
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(number))
}

const ProductsContent = ({ setActiveTab, onEditProduct, onViewProductDetail, data }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [isFilterVisible, setIsFilterVisible] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [product, setProduct] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [collections, setCollections] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [isAllSelected, setIsAllSelected] = useState(false)
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

    const [displayMinPrice, setDisplayMinPrice] = useState("")
    const [displayMaxPrice, setDisplayMaxPrice] = useState("")
    const [filters, setFilters] = useState({
        category: "",
        collection: "",
        status: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "newest",
    })

    // ✅ Xử lý chọn checkbox
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(product.map(p => p._id))
        }
        setIsAllSelected(!isAllSelected)
    }

    const handleSelectOne = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleToggleFeatured = async (id, currentStatus) => {
        try {
            const res = await apiAdmin.patch(`/products/${id}/toggle-featured`)
            toast.success(
                res.data.product.isFeatured
                    ? "✅ Sản phẩm đã được đánh dấu nổi bật!"
                    : "❌ Đã tắt nổi bật cho sản phẩm này."
            )
            fetchProducts(page, filters, searchTerm)
        } catch (err) {
            console.error(err)
            toast.error("Không thể thay đổi trạng thái nổi bật ❌")
        }
    }
    // ✅ Bulk Update Status
    const handleBulkUpdateStatus = async (status) => {
        if (selectedProducts.length === 0) return toast.info("Vui lòng chọn sản phẩm trước.")
        try {
            await apiAdmin.put("/products/bulk-update-status", {
                ids: selectedProducts,
                status,
            })
            toast.success("Cập nhật trạng thái hàng loạt thành công 🎉")
            fetchProducts()
            setSelectedProducts([])
            setIsAllSelected(false)
        } catch (err) {
            console.error(err)
            toast.error("Không thể cập nhật trạng thái ❌")
        }
    }
    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0)
            return toast.info("Vui lòng chọn sản phẩm để xóa.")

        setIsBulkDeleteModalOpen(true)
    }

    const confirmBulkDelete = async () => {
        try {
            await apiAdmin.delete("/products/bulk-delete", {
                data: { ids: selectedProducts },
            })
            toast.success("Đã xóa sản phẩm được chọn ✅")
            fetchProducts()
            setSelectedProducts([])
            setIsAllSelected(false)
        } catch (err) {
            console.error(err)
            toast.error("Xóa sản phẩm thất bại ❌")
        } finally {
            setIsBulkDeleteModalOpen(false)
        }
    }


    // ✅ Bulk Delete

    const limit = 10
    const fetchFiltersData = async () => {
        try {
            const [cats, cols] = await Promise.all([
                apiAdmin.get("/categories"),
                apiAdmin.get("/collection"),
            ])
            setCategories(cats.data)
            setCollections(cols.data)
        } catch (err) {
            console.error("Lỗi tải danh mục hoặc bộ sưu tập:", err)
        }
    }

    // 🔹 Gọi API sản phẩm
    const fetchProducts = async (pageNum = 1, filtersData = filters, keyword = searchTerm) => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pageNum,
                limit,
                q: keyword || "",
                category: filtersData.category || "",
                collection: filtersData.collection || "",
                status: filtersData.status || "",
                minPrice: filtersData.minPrice || "",
                maxPrice: filtersData.maxPrice || "",
                sortBy: filtersData.sortBy || "newest",
            })

            const res = await apiAdmin.get(`/products?${params.toString()}`)
            setProduct(res.data.products || [])
            setTotal(res.data.total || 0)
            setPage(res.data.page || 1)
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchFiltersData()
    }, [])
    const debouncedFetch = useMemo(
        () => debounce((pageNum, filtersData, keyword) => {
            fetchProducts(pageNum, filtersData, keyword)
        }, 500),
        []
    )

    useEffect(() => {
        // Luôn chuyển về trang 1 khi filter hoặc search thay đổi
        if (page === 1) {
            debouncedFetch(1, filters, searchTerm)
        } else {
            // Chỉ gọi API với page 1, còn không thì trigger lại bằng cách setPage(1)
            setPage(1)
        }
        return () => debouncedFetch.cancel()
    }, [filters, searchTerm])

    // Gọi API khi page thay đổi
    useEffect(() => {
        if (page) {
            fetchProducts(page, filters, searchTerm)
        }
    }, [page])

    const handlePriceChange = (e) => {
        const { name, value } = e.target
        // Loại bỏ mọi ký tự không phải số và dấu chấm (dấu thập phân)
        const rawValue = value.replace(/[^0-9]/g, "")

        if (name === 'minPrice') {
            setFilters(prev => ({ ...prev, minPrice: rawValue }))
            setDisplayMinPrice(rawValue)
        } else {
            setFilters(prev => ({ ...prev, maxPrice: rawValue }))
            setDisplayMaxPrice(rawValue)
        }
    }

    // Xử lý Blur để định dạng giá trị hiển thị
    const handlePriceBlur = (e) => {
        const { name } = e.target
        const rawValue = filters[name]

        if (rawValue) {
            const formattedValue = new Intl.NumberFormat('vi-VN').format(Number(rawValue))
            if (name === 'minPrice') {
                setDisplayMinPrice(formattedValue)
            } else {
                setDisplayMaxPrice(formattedValue)
            }
        }
    }

    // Xử lý Focus để xóa định dạng cho dễ nhập
    const handlePriceFocus = (e) => {
        const { name } = e.target
        const rawValue = filters[name]
        if (rawValue) {
            if (name === 'minPrice') {
                setDisplayMinPrice(rawValue)
            } else {
                setDisplayMaxPrice(rawValue)
            }
        }
    }
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleExportExcel = async () => {
        try {
            setLoading(true)
            const res = await apiAdmin.get("/excel/products/export", {
                responseType: "blob",
            })
            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `orders_${new Date().toISOString().split("T")[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            toast.success("Xuất file Excel thành công 🎉")
        } catch (err) {
            console.error(err)
            toast.error("Không thể xuất Excel ❌")
        } finally {
            setLoading(false)
        }
    }


    const toggleFilterDropdown = () => {
        setIsFilterVisible(!isFilterVisible)
    }
    const handleDeleteClick = (product) => {
        setProductToDelete(product)
        setIsModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        await apiAdmin.delete(`/products/${productToDelete?._id}`)
        toast.success("Xóa sản phẩm thành công")
        fetchProducts(page, filters, searchTerm)
        setIsModalOpen(false)
    }

 console.log(product);
 
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setProductToDelete(null)
    }
    const handleResetFilters = () => {
        setFilters({
            category: "",
            collection: "",
            status: "",
            minPrice: "",
            maxPrice: "",
            sortBy: "newest",
        })
        setDisplayMinPrice("")
        setDisplayMaxPrice("")
    }
    return (
        <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="p-6  min-h-screen">
                        <h1 className="text-3xl font-bold mb-4 ">Danh sách Sản phẩm</h1>

            {selectedProducts.length > 0 && (
                <div className="p-4 mb-4 rounded-xl shadow flex justify-between items-center border border-pink-200">
                    <p className=" font-medium">
                        Đã chọn <span className="font-bold text-pink-600">{selectedProducts.length}</span> sản phẩm
                    </p>
                    <div className="flex space-x-3 items-center">
                        <select
                            onChange={(e) => handleBulkUpdateStatus(e.target.value)}
                            defaultValue=""
                            className="border text-black rounded-xl px-3 py-2 focus:ring-pink-500"
                        >
                            <option value="" disabled>Đổi trạng thái...</option>
                            <option value="Còn hàng">Còn hàng</option>
                            <option value="Hết hàng">Hết hàng</option>
                            <option value="Ngừng bán">Ngừng bán</option>
                        </select>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                        >
                            Xóa sản phẩm đã chọn
                        </button>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-lg w-1/3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="space-x-2 flex items-center">
                    <button
                        onClick={toggleFilterDropdown}
                        className={`px-4 py-2 rounded-xl flex items-center space-x-1 font-medium transition-all ${isFilterVisible
                            ? 'bg-pink-600 text-white hover:bg-pink-700'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
                    >
                        <FunnelIcon className="w-5 h-5" />
                        <span>Bộ lọc</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        disabled={loading}
                        className="flex items-center space-x-1 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Xuất báo cáo</span>
                    </button>
                    {/* Modal Import Excel */}
                    <ShowImportModal fetchProducts={fetchProducts} />
                    <button
                        onClick={() => setActiveTab('add-product')}
                        className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>

            </div>

            {isFilterVisible && (
                <div className="mt-4 p-5 border rounded-xl shadow-lg mb-6">
                    <h4 className="text-lg font-semibold  mb-4 border-b pb-2">Bộ lọc nâng cao</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                        {/* Danh mục */}
                        <div>
                            <label className="block text-sm font-medium  mb-1">Danh mục</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full px-3 text-black py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bộ sưu tập */}
                        <div>
                            <label className="block text-sm font-medium  mb-1">Bộ sưu tập</label>
                            <select
                                name="collection"
                                value={filters.collection}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            >
                                <option value="">Tất cả bộ sưu tập</option>
                                {collections.map((col) => (
                                    <option key={col._id} value={col._id}>
                                        {col.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-medium  mb-1">Trạng thái</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="Còn hàng">Còn hàng</option>
                                <option value="Hết hàng">Hết hàng</option>
                                <option value="Ngừng bán">Ngừng bán</option>
                            </select>
                        </div>

                        {/* Giá tối thiểu */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Giá tối thiểu (VND)</label>
                            <input
                                type="text"
                                name="minPrice"
                                placeholder="VD: 50.000"
                                value={displayMinPrice} // Hiển thị giá trị đã định dạng (hoặc số thô khi focus)
                                onChange={handlePriceChange}
                                onFocus={handlePriceFocus}
                                onBlur={handlePriceBlur}
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            />
                        </div>

                        {/* Giá tối đa */}
                        <div>
                            <label className="block text-sm font-medium  mb-1">Giá tối đa (VND)</label>
                            <input
                                type="text"
                                name="maxPrice"
                                placeholder="VD: 500.000"
                                value={displayMaxPrice} // Hiển thị giá trị đã định dạng (hoặc số thô khi focus)
                                onChange={handlePriceChange}
                                onFocus={handlePriceFocus}
                                onBlur={handlePriceBlur}
                                className="w-full text-black px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            />
                        </div>
                    </div>

                    {/* Hàng Sắp xếp và nút Reset */}
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                        {/* Sắp xếp */}
                        <div className="w-1/3">
                            <label className="block text-sm font-medium  mb-1">Sắp xếp theo</label>
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleFilterChange}
                                className="w-full px-3 text-black py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="priceAsc">Giá tăng dần</option>
                                <option value="priceDesc">Giá giảm dần</option>
                                <option value="stockAsc">Tồn kho thấp → cao</option>
                                <option value="stockDesc">Tồn kho cao → thấp</option>
                            </select>
                        </div>

                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-gray-200 text-black rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto  rounded-xl shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-pink-50">
                        <tr>
                            <th className="px-4  text-left text-sm">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Danh mục</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Bộ sưu tập</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Giá</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nổi bật</th>

                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {product?.map((product) => (
                            <tr key={product.Id} className="hover:bg-pink-50 hover:text-black">
                                <td className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product._id)}
                                        onChange={() => handleSelectOne(product._id)}
                                    />
                                </td>
                                <td className="px-6 py-4">{product.Id}</td>
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <LazyLoadImage
                                        src={product.mainImage || "https://placehold.co/100x100"}
                                        alt={product?.name}
                                        effect="blur"
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />                                    <div>
                                        <p className="font-semibold">{product?.name}</p>
                                        <p className="text-gray-400 text-sm">SKU: {product?.sku}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{product?.category?.name}</td>
                                <td className="px-6 py-4">{product?.collection?.name}</td>
                                <td className="px-6 py-4 font-semibold text-pink-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product?.originalPrice)}
                                </td>
                                <td className="px-6 py-4">{product?.stock}</td>
                                <td className="px-6 py-4">
                                    <Switch
                                        checked={product.isFeatured}
                                        onChange={() => handleToggleFeatured(product._id, !product.isFeatured)}
                                    />

                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[product?.status]}`}>
                                        {product?.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button
                                        onClick={() => onViewProductDetail(product?._id)}
                                        className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onEditProduct(product?._id)} // Thêm onClick để chuyển trang
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(product)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {total > limit && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            ← Trước
                        </button>

                        {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-1 border rounded-lg font-semibold ${page === i + 1
                                    ? "bg-pink-600 text-white"
                                    : "bg-white hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            disabled={page >= Math.ceil(total / limit)}
                            className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </div>
            {productToDelete && (
                <DeleteProductModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                    product={productToDelete}
                />
            )}
            <ConfirmBulkDeleteModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                count={selectedProducts.length}
            />

        </div>
    )
}

export default ProductsContent
