import React, { useEffect, useState } from "react"
import { PencilIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import DeleteProductModal from "@/components/DeleteProductPopup"



const statusColors = {
    "Còn hàng": "bg-green-100 text-green-600",
    "Hết hàng": "bg-red-100 text-red-600",
    "Ngừng bán": "bg-blue-100 text-blue-600",
}

const ProductsContent = ({ setActiveTab }) => {
    const products = [
    { id: "PF001", name: "Váy hồng thanh lịch", category: "Váy đầm", price: "590.000đ", stock: 25, status: "Còn hàng", image: "/images/product1.png" },
    { id: "PF002", name: "Áo sơ mi trắng basic", category: "Váy đầm", price: "450.000đ", stock: 18, status: "Còn hàng", image: "/images/product1.png" },
    { id: "PF003", name: "Chân váy xòe", category: "Áo", price: "380.000đ", stock: 32, status: "Còn hàng", image: "/images/product1.png" },
    { id: "PF004", name: "Áo cardigan hồng", category: "Áo", price: "720.000đ", stock: 12, status: "Còn hàng", image: "/images/product1.png" },
    { id: "PF005", name: "Quần jeans skinny", category: "Quần", price: "650.000đ", stock: 8, status: "Hết hàng", image: "/images/product1.png" },
    { id: "PF006", name: "Áo thun cotton", category: "Quần", price: "250.000đ", stock: 45, status: "Ngừng bán", image: "/images/product1.png" },
]
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [isFilterVisible, setIsFilterVisible] = useState(false)
    const [filters, setFilters] = useState({ category: 'Tất cả', status: 'Tất cả', minPrice: '', maxPrice: '' })
    const [searchTerm, setSearchTerm] = useState('');
    const [product, setProducts] = useState(products);

    useEffect(() => {
        const filtered = products.filter(product => {
            const categoryMatch = filters.category === 'Tất cả' || product.category === filters.category
            const statusMatch = filters.status === 'Tất cả' || product.status === filters.status
            const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())

            const minPrice = parseFloat(filters.minPrice)
            const maxPrice = parseFloat(filters.maxPrice)
            const priceMatch = (isNaN(minPrice) || product.price >= minPrice) && (isNaN(maxPrice) || product.price <= maxPrice)

            return categoryMatch && statusMatch && searchMatch && priceMatch
        })
    }, [filters, searchTerm])

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const toggleFilterDropdown = () => {
        setIsFilterVisible(!isFilterVisible)
    }
    const handleDeleteClick = (product) => {
        setProductToDelete(product)
        setIsModalOpen(true)
    }

    const handleConfirmDelete = () => {
        // Gọi API hoặc logic để xóa sản phẩm
        console.log("Xóa sản phẩm có ID:", productToDelete.id)
        setIsModalOpen(false) // Đóng modal sau khi xóa thành công
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setProductToDelete(null)
    }
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="px-4 py-2 border rounded-lg w-1/3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="space-x-2 flex items-center">
                    <button onClick={toggleFilterDropdown} className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 flex items-center space-x-1">
                        <FunnelIcon className="w-5 h-5" />
                        <span>Bộ lọc</span>
                    </button>
                    <button className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 flex items-center space-x-1">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('add-product')}
                        className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
               
            </div>
             {isFilterVisible && (
                    <div className="mt-4  pt-4 border-t border-gray-200 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Bộ lọc danh mục */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <select
                                id="category"
                                name="category"
                                value={filters?.category}
                                onChange={handleFilterChange}
                                className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all w-full"
                            >
                                <option value="Tất cả">Tất cả danh mục</option>
                                <option value="Váy">Váy</option>
                                <option value="Áo">Áo</option>
                                <option value="Quần">Quần</option>
                            </select>
                        </div>

                        {/* Bộ lọc trạng thái */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                id="status"
                                name="status"
                                value={filters?.status}
                                onChange={handleFilterChange}
                                className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all w-full"
                            >
                                <option value="Tất cả">Tất cả trạng thái</option>
                                <option value="Còn hàng">Còn hàng</option>
                                <option value="Hết hàng">Hết hàng</option>
                            </select>
                        </div>

                        {/* Bộ lọc giá tiền */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="Tối thiểu"
                                    value={filters?.minPrice}
                                    onChange={handleFilterChange}
                                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Tối đa"
                                    value={filters?.maxPrice}
                                    onChange={handleFilterChange}
                                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-pink-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Danh mục</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Giá</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-pink-50">
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-gray-400 text-sm">SKU: {product.id}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4 font-semibold text-pink-600">{product.price}</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[product.status]}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => setActiveTab('edit-product')} // Thêm onClick để chuyển trang
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(product.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {productToDelete && (
                <DeleteProductModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                    product={productToDelete}
                />
            )}
        </div>
    )
}

export default ProductsContent
